-- Supabase Edge Function: Create Notification
-- This function creates notifications and can be called from other parts of the system
-- Usage: SELECT create_notification(user_id, type, title, message, priority, action_url, action_text, metadata, expires_at);

-- Example usage:
-- SELECT create_notification(
--     'user-uuid-here',
--     'certificate_expiry',
--     'Certificate Expiring Soon',
--     'Your STCW certificate expires on 2024-12-31. Please renew soon.',
--     'high',
--     '/certificates',
--     'View Certificates',
--     '{"certificate_id": "cert-123"}',
--     '2024-12-25T23:59:59Z'::timestamptz
-- );

-- Function to create notification and return ID
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id uuid,
    p_type notification_type,
    p_title varchar(255),
    p_message text,
    p_priority notification_priority default 'medium',
    p_action_url text default null,
    p_action_text varchar(100) default null,
    p_metadata jsonb default null,
    p_expires_at timestamptz default null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id uuid;
    v_user_preferences jsonb;
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
    
    -- Check user notification preferences
    SELECT enabled_types INTO v_user_preferences 
    FROM public.notification_preferences 
    WHERE user_id = p_user_id;
    
    -- If no preferences exist, use defaults (allow all types)
    IF v_user_preferences IS NULL THEN
        v_user_preferences = array[
            'certificate_expiry',
            'travel_reminder', 
            'new_circular',
            'signoff_reminder',
            'system_announcement',
            'document_update',
            'crew_message',
            'general'
        ];
    END IF;
    
    -- Check if this notification type is enabled for the user
    IF NOT (p_type = ANY(v_user_preferences)) THEN
        RAISE NOTICE 'Notification type % disabled for user %', p_type, p_user_id;
        RETURN NULL;
    END IF;
    
    -- Create the notification
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        priority,
        action_url,
        action_text,
        metadata,
        expires_at,
        is_read,
        created_at
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_priority,
        p_action_url,
        p_action_text,
        p_metadata,
        p_expires_at,
        false,
        now()
    ) RETURNING id INTO v_notification_id;
    
    -- Log the creation
    RAISE NOTICE 'Notification created for user % with ID %', p_user_id, v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- Function to create bulk notifications
CREATE OR REPLACE FUNCTION create_bulk_notifications(
    p_user_ids uuid[],
    p_type notification_type,
    p_title varchar(255),
    p_message text,
    p_priority notification_priority default 'medium',
    p_action_url text default null,
    p_action_text varchar(100) default null,
    p_metadata jsonb default null,
    p_expires_at timestamptz default null
)
RETURNS TABLE(
    user_id uuid,
    notification_id uuid,
    success boolean,
    error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_notification_id uuid;
    v_success boolean;
    v_error_message text;
BEGIN
    -- Loop through each user
    FOREACH v_user_id IN ARRAY p_user_ids
    LOOP
        BEGIN
            -- Try to create notification for this user
            SELECT create_notification(
                v_user_id,
                p_type,
                p_title,
                p_message,
                p_priority,
                p_action_url,
                p_action_text,
                p_metadata,
                p_expires_at
            ) INTO v_notification_id;
            
            IF v_notification_id IS NOT NULL THEN
                v_success = true;
                v_error_message = null;
            ELSE
                v_success = false;
                v_error_message = 'Notification type disabled for user';
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            v_success = false;
            v_error_message = SQLERRM;
            v_notification_id = null;
        END;
        
        -- Return result for this user
        RETURN QUERY SELECT 
            v_user_id,
            v_notification_id,
            v_success,
            v_error_message;
    END LOOP;
END;
$$;

-- Function to create notification from template
CREATE OR REPLACE FUNCTION create_notification_from_template(
    p_user_id uuid,
    p_type notification_type,
    p_template_data jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id uuid;
    v_title varchar(255);
    v_message text;
    v_template_var varchar;
    v_template_value text;
    v_final_title varchar(255);
    v_final_message text;
    v_priority notification_priority;
BEGIN
    -- Set default templates based on type
    CASE p_type
        WHEN 'certificate_expiry' THEN
            v_title := 'Certificate Expiring Soon';
            v_message := 'Your {certificate_type} certificate expires on {expiry_date}. Please renew it soon.';
            v_priority := 'high';
        WHEN 'travel_reminder' THEN
            v_title := 'Travel Reminder';
            v_message := 'You have {travel_type} scheduled for {departure_date} at {departure_time} from {departure_location}.';
            v_priority := 'medium';
        WHEN 'new_circular' THEN
            v_title := 'New Circular Available';
            v_message := 'A new circular "{circular_title}" has been published. Please review and acknowledge if required.';
            v_priority := 'medium';
        WHEN 'signoff_reminder' THEN
            v_title := 'Sign-off Checklist Reminder';
            v_message := 'Don''t forget to complete your sign-off checklist before leaving.';
            v_priority := 'medium';
        ELSE
            v_title := 'Notification';
            v_message := 'You have a new notification.';
            v_priority := 'medium';
    END CASE;
    
    -- Replace template variables
    v_final_title := v_title;
    v_final_message := v_message;
    
    -- Replace {variable} patterns with actual values
    FOR v_template_var, v_template_value IN 
        SELECT key, value::text 
        FROM jsonb_each_text(p_template_data)
    LOOP
        v_final_title := replace(v_final_title, '{' || v_template_var || '}', v_template_value);
        v_final_message := replace(v_final_message, '{' || v_template_var || '}', v_template_value);
    END LOOP;
    
    -- Create the notification
    SELECT create_notification(
        p_user_id,
        p_type,
        v_final_title,
        v_final_message,
        v_priority,
        case when p_template_data ? 'action_url' then (p_template_data->>'action_url')::text else null end,
        case when p_template_data ? 'action_text' then (p_template_data->>'action_text')::text else null end,
        p_template_data,
        case when p_template_data ? 'expires_at' then (p_template_data->>'expires_at')::timestamptz else null end
    ) INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION create_bulk_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification_from_template TO authenticated;
