-- Migration: Sign-off Checklist Seed Data
-- Description: Sample sign-off checklist and relieving officer data
-- Created: 2024-12-01

-- =============================================================================
-- SAMPLE SIGN-OFF CHECKLIST ITEMS
-- =============================================================================

-- Note: Replace user_id with actual user IDs from your auth.users table
-- These are sample checklist items for demo purposes

-- Sample relieving officers (you'd typically store these in a separate crews/officers table)
-- For demo purposes, we'll create placeholder relieving officers
CREATE TABLE IF NOT EXISTS relieving_officers (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id),
    relieving_user_id uuid references auth.users(id),
    name varchar(200) not null,
    rank varchar(100) not null,
    email varchar(200) not null,
    phone varchar(20),
    joining_date date not null,
    vessel_id uuid references vessels(id),
    notes text,
    created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE relieving_officers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for relieving_officers
CREATE POLICY "Users can view relieving officers for their assignments" 
ON relieving_officers FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = relieving_user_id);

CREATE POLICY "Users can manage their own relieving officer records" 
ON relieving_officers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their relieving officer records" 
ON relieving_officers FOR UPDATE 
USING (auth.uid() = user_id);

-- =============================================================================
-- SAMPLE NOTIFICATIONS FOR SIGN-OFF PROCESS
-- =============================================================================

-- Insert sample notifications to demonstrate the sign-off notification system
INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES
-- Note: Replace these UUIDs with actual user IDs from your auth.users table
('00000000-0000-0000-0000-000000000000', 'assignment', 
 'Sign-off Checklist Available', 
 'Your sign-off checklist is now available. Complete it before your departure date.',
 '/signoff', false),

('00000000-0000-0000-0000-000000000000', 'assignment',
 'Sign-off Checklist Reminder', 
 'You have pending sign-off tasks. Complete them before your departure.',
 '/signoff', false),

('00000000-0000-0000-0000-000000000000', 'assignment',
 'Urgent: Sign-off Due Soon', 
 'Your sign-off is in 3 days. Please complete all outstanding tasks immediately.',
 '/signoff', false);

-- =============================================================================
-- HELPFUL VIEWS FOR SIGN-OFF MANAGEMENT
-- =============================================================================

-- Create a view for sign-off progress summary
CREATE OR REPLACE VIEW signoff_progress_summary AS
SELECT 
    a.id as assignment_id,
    a.user_id,
    a.vessel_id,
    v.vessel_name,
    a.join_date,
    a.expected_signoff_date,
    a.status,
    
    -- Checklist progress
    COUNT(sci.id) as total_checklist_items,
    COUNT(CASE WHEN sci.is_completed = true THEN 1 END) as completed_items,
    CASE 
        WHEN COUNT(sci.id) = 0 THEN 0
        ELSE ROUND(
            (COUNT(CASE WHEN sci.is_completed = true THEN 1 END)::numeric / COUNT(sci.id)::numeric) * 100, 
            2
        )
    END as completion_percentage,
    
    -- Category progress
    COUNT(CASE WHEN sci.category = 'administrative' THEN 1 END) as admin_total,
    COUNT(CASE WHEN sci.category = 'administrative' AND sci.is_completed = true THEN 1 END) as admin_completed,
    COUNT(CASE WHEN sci.category = 'handover' THEN 1 END) as handover_total,
    COUNT(CASE WHEN sci.category = 'handover' AND sci.is_completed = true THEN 1 END) as handover_completed,
    COUNT(CASE WHEN sci.category = 'documentation' THEN 1 END) as docs_total,
    COUNT(CASE WHEN sci.category = 'documentation' AND sci.is_completed = true THEN 1 END) as docs_completed,
    COUNT(CASE WHEN sci.category = 'financial' THEN 1 END) as financial_total,
    COUNT(CASE WHEN sci.category = 'financial' AND sci.is_completed = true THEN 1 END) as financial_completed,
    COUNT(CASE WHEN sci.category = 'personal_preparation' THEN 1 END) as personal_total,
    COUNT(CASE WHEN sci.category = 'personal_preparation' AND sci.is_completed = true THEN 1 END) as personal_completed
    
FROM assignments a
LEFT JOIN vessels v ON a.vessel_id = v.id
LEFT JOIN signoff_checklist_items sci ON a.id = sci.assignment_id AND a.user_id = sci.user_id
WHERE a.status = 'active'
GROUP BY a.id, a.user_id, a.vessel_id, v.vessel_name, a.join_date, a.expected_signoff_date, a.status;

COMMENT ON VIEW signoff_progress_summary IS 'Summary view of sign-off checklist progress by assignment';

-- =============================================================================
-- FUNCTIONS FOR SIGN-OFF MANAGEMENT
-- =============================================================================

-- Function to create default checklist for an assignment
CREATE OR REPLACE FUNCTION create_default_signoff_checklist(p_assignment_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item_record RECORD;
BEGIN
    -- Check if checklist already exists
    IF EXISTS (SELECT 1 FROM signoff_checklist_items WHERE assignment_id = p_assignment_id AND user_id = p_user_id) THEN
        RETURN;
    END IF;

    -- Insert default checklist items
    INSERT INTO signoff_checklist_items (user_id, assignment_id, item_text, category, is_completed, order_index)
    SELECT 
        p_user_id,
        p_assignment_id,
        default_items.item_text,
        default_items.category,
        false,
        default_items.order_index
    FROM (
        VALUES 
            ('Submit crew change notification to port agent', 'administrative', 1),
            ('Complete vessel departure notification', 'administrative', 2),
            ('Update arrival/departure logbook', 'administrative', 3),
            ('Submit crew list updates to immigration', 'administrative', 4),
            ('Arrange transportation from vessel', 'administrative', 5),
            ('Brief relieving officer on vessel operations', 'handover', 1),
            ('Complete technical handover checklist', 'handover', 2),
            ('Hand over vessel keys and access codes', 'handover', 3),
            ('Brief emergency procedures and contacts', 'handover', 4),
            ('Update vessel standing orders document', 'handover', 5),
            ('Complete discharge certificate', 'documentation', 1),
            ('Sign vessel logbook entries', 'documentation', 2),
            ('Complete seaman''s book endorsement', 'documentation', 3),
            ('Exchange certificates with relieving officer', 'documentation', 4),
            ('Update insurance and personal documents', 'documentation', 5),
            ('Calculate final salary payment', 'financial', 1),
            ('Settle any outstanding advances', 'financial', 2),
            ('Complete expense declarations', 'financial', 3),
            ('Arrange sign-off bonus payment', 'financial', 4),
            ('Verify travel allowance calculations', 'financial', 5),
            ('Pack personal belongings securely', 'personal_preparation', 1),
            ('Complete personal incident reporting', 'personal_preparation', 2),
            ('Update emergency contact information', 'personal_preparation', 3),
            ('Prepare travel documentation', 'personal_preparation', 4),
            ('Complete crew feedback form', 'personal_preparation', 5)
    ) AS default_items(item_text, category, order_index);
END;
$$;

COMMENT ON FUNCTION create_default_signoff_checklist IS 'Creates a default checklist for a vessel assignment';

-- =============================================================================
-- AUTOMATED CHECKLIST CREATION TRIGGER
-- =============================================================================

-- Function to automatically create checklist for new assignments
CREATE OR REPLACE FUNCTION trigger_create_signoff_checklist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create default checklist 30 days before expected sign-off
    -- For demo purposes, we'll create it immediately
    PERFORM create_default_signoff_checklist(NEW.id, NEW.user_id);
    RETURN NEW;
END;
$$;

-- Trigger to create checklist when assignment is created
CREATE TRIGGER create_signoff_checklist_on_assignment_insert
    AFTER INSERT ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_signoff_checklist();

COMMENT ON TRIGGER create_signoff_checklist_on_assignment_insert ON assignments IS 'Automatically creates default sign-off checklist for new assignments';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================



