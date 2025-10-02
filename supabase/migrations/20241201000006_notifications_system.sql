-- Migration: Notifications and Alerts System
-- Description: Creates tables and functions for the notification system
-- Created: 2024-12-01
-- Version: 1.0

-- Create notification types enum
create type notification_type as enum (
    'certificate_expiry',
    'travel_reminder',
    'new_circular',
    'signoff_reminder',
    'system_announcement',
    'document_update',
    'crew_message',
    'general'
);

-- Create notification priority enum
create type notification_priority as enum (
    'low',
    'medium',
    'high',
    'urgent'
);

-- Create notifications table
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type notification_type not null,
    title varchar(255) not null,
    message text not null,
    priority notification_priority not null default 'medium',
    action_url text,
    action_text varchar(100),
    metadata jsonb,
    is_read boolean default false,
    read_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz default now()
);

-- Create notification preferences table
create table public.notification_preferences (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    email_notifications boolean default true,
    push_notifications boolean default true,
    sound_enabled boolean default true,
    vibration_enabled boolean default true,
    enabled_types notification_type[] default array[
        'certificate_expiry',
        'travel_reminder',
        'new_circular',
        'signoff_reminder',
        'system_announcement',
        'document_update',
        'crew_message',
        'general'
    ],
    digest_frequency text default 'daily' check (digest_frequency in ('daily', 'weekly', 'never')),
    quiet_hours jsonb default '{"start": "22:00", "end": "08:00"}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    unique (user_id)
);

-- Create notification triggers table for automated notifications
create table public.notification_triggers (
    id uuid primary key default uuid_generate_v4(),
    type notification_type not null,
    trigger_event varchar(100) not null,
    conditions jsonb not null,
    template_title varchar(255),
    template_message text,
    priority notification_priority default 'medium',
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create indexes for performance
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_type on public.notifications(type);
create index idx_notifications_priority on public.notifications(priority);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);
create index idx_notifications_expires_at on public.notifications(expires_at);
create index idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;

-- Index for notification preferences
create index idx_notification_preferences_user_id on public.notification_preferences(user_id);

-- Enable RLS
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table general.notification_triggers enable row level security;

-- Create RLS policies
-- Notifications policies
create policy "Users can view their own notifications" on public.notifications
    for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
    for update using (auth.uid() = user_id);

create policy "Users can delete their own notifications" on public.notifications
    for delete using (auth.uid() = user_id);

-- Service roles can insert notifications for any user
create policy "Service roles can insert notifications" on public.notifications
    for insert with check (true);

-- Notification preferences policies
create policy "Users can view their own notification preferences" on public.notification_preferences
    for select using (auth.uid() = user_id);

create policy "Users can insert their own notification preferences" on public.notification_preferences
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own notification preferences" on public.notification_preferences
    for update using (auth.uid() = user_id);

-- Notification triggers policies (admin only for now)
create policy "Admin can view notification triggers" on public.notification_triggers
    for select using (true);

create policy "Admin can manage notification triggers" on public.notification_triggers
    for all using (true);

-- Create functions for notification management

-- Function to cleanup expired notifications
create or replace function cleanup_expired_notifications()
returns void
language sql
security definer
as $$
    delete from public.notifications 
    where expires_at is not null and expires_at < now();
$$;

-- Function to get user notification preferences
create or replace function get_user_notification_preferences(p_user_id uuid)
returns table (
    id uuid,
    user_id uuid,
    email_notifications boolean,
    push_notifications boolean,
    sound_enabled boolean,
    vibration_enabled boolean,
    enabled_types notification_type[],
    digest_frequency text,
    quiet_hours jsonb,
    created_at timestamptz,
    updated_at timestamptz
)
language sql
security definer
as $$
    select * from public.notification_preferences where user_id = p_user_id;
$$;

-- Function to check if user allows notification type
create or replace function user_allows_notification_type(
    p_user_id uuid,
    p_notification_type notification_type
)
returns boolean
language sql
security definer
as $$
    select 
        case 
            when exists (
                select 1 from public.notification_preferences 
                where user_id = p_user_id 
                and p_notification_type = any(enabled_types)
            ) then true
            else false
        end;
$$;

-- Function to get unread notification count
create or replace function get_unread_notification_count(p_user_id uuid)
returns integer
language sql
security definer
as $$
    select count(*)::integer 
    from public.notifications 
    where user_id = p_user_id 
    and is_read = false
    and (expires_at is null or expires_at > now());
$$;

-- Function to mark notification as read
create or replace function mark_notification_read(p_notification_id uuid, p_user_id uuid)
returns void
language sql
security definer
as $$
    update public.notifications 
    set is_read = true, read_at = now() 
    where id = p_notification_id 
    and user_id = p_user_id;
$$;

-- Function to mark all notifications as read for a user
create or replace function mark_all_notifications_read(p_user_id uuid)
returns void
language sql
security definer
as $$
    update public.notifications 
    set is_read = true, read_at = now() 
    where user_id = p_user_id 
    and is_read = false;
$$;

-- Function to create notification (triggered by system)
create or replace function create_notification(
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
returns uuid
language plpgsql
security definer
as $$
declare
    v_notification_id uuid;
begin
    -- Check if user allows this notification type
    if not user_allows_notification_type(p_user_id, p_type) then
        return null;
    end if;
    
    insert into public.notifications (
        user_id,
        type,
        title,
        message,
        priority,
        action_url,
        action_text,
        metadata,
        expires_at
    ) values (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_priority,
        p_action_url,
        p_action_text,
        p_metadata,
        p_expires_at
    ) returning id into v_notification_id;
    
    return v_notification_id;
end;
$$;

-- Function to delete expired notifications (should be called by a cron job)
create or replace function delete_notifications_cleanup()
returns void
language sql
security definer
as $$
    delete from public.notifications 
    where expires_at is not null 
    and expires_at < now();
$$;

-- Insert default notification triggers
insert into public.notification_triggers (type, trigger_event, conditions, template_title, template_message, priority) values
('certificate_expiry', 'certificate_expiry_6_months', '{"days_before_expiry": 180}', 'Certificate Expiring Soon', 'Your {certificate_type} certificate expires in 6 months on {expiry_date}. Please start the renewal process.', 'low'),
('certificate_expiry', 'certificate_expiry_3_months', '{"days_before_expiry": 90}', 'Certificate Expiring Soon', 'Your {certificate_type} certificate expires in 3 months on {expiry_date}. Please renew it soon.', 'medium'),
('certificate_expiry', 'certificate_expiry_1_month', '{"days_before_expiry": 30}', 'Certificate Expiring Soon', 'Your {certificate_type} certificate expires in 1 month on {expiry_date}. Renewal is now urgent.', 'high'),
('certificate_expiry', 'certificate_expiry_2_weeks', '{"days_before_expiry": 14}', 'Certificate Expiring Urgently', 'Your {certificate_type} certificate expires in 2 weeks on {expiry_date}. Immediate action required.', 'urgent'),

('travel_reminder', 'travel_72_hours', '{"hours_before_departure": 72}', 'Travel Reminder', 'You have {travel_type} scheduled in 72 hours from {departure_location}.', 'medium'),
('travel_reminder', 'travel_24_hours', '{"hours_before_departure": 24}', 'Travel Reminder', 'You have {travel_type} scheduled tomorrow from {departure_location}. Prepare for departure.', 'high'),
('travel_reminder', 'travel_3_hours', '{"hours_before_departure": 3}', 'Travel Reminder', 'You have {travel_type} departing in 3 hours from {departure_location}. Check-in soon.', 'urgent'),

('new_circular', 'circular_published', '{}', 'New Circular Available', 'A new circular "{circular_title}" has been published. Please review and acknowledge if required.', 'medium'),
('new_circular', 'circular_unacknowledged_reminder', '{"days_unread": 3}', 'Unread Circular Reminder', 'You have an unacknowledged circular "{circular_title}" that requires attention.', 'high'),

('signoff_reminder', 'signoff_weekly_reminder', '{"frequency": "weekly"}', 'Sign-off Checklist Reminder', 'Don''t forget to complete your sign-off checklist before leaving the vessel.', 'medium');

-- Grant permissions
grant select, update, delete on public.notifications to authenticated;
grant select, insert, update on public.notification_preferences to authenticated;
grant select on public.notification_triggers to authenticated;

-- Grant function permissions
grant execute on function cleanup_expired_notifications() to authenticated;
grant execute on function get_user_notification_preferences(uuid) to authenticated;
grant execute on function user_allows_notification_type(uuid, notification_type) to authenticated;
grant execute on function get_unread_notification_count(uuid) to authenticated;
grant execute on function mark_notification_read(uuid, uuid) to authenticated;
grant execute on function mark_all_notifications_read(uuid) to authenticated;

-- Sample notifications for testing (optional)
-- Replace '00000000-0000-0000-0000-000000000000' with actual user IDs
/*
insert into public.notifications (
    user_id,
    type,
    title,
    message,
    priority,
    action_url,
    action_text,
    expires_at
) values 
(
    '00000000-0000-0000-0000-000000000000',
    'certificate_expiry',
    'STCW Certificate Expiring Soon',
    'Your STCW Certificate expires on 2024-12-31. Please start the renewal process.',
    'high',
    '/certificates',
    'View Certificates',
    '2024-12-25'::timestamptz
),
(
    '00000000-0000-0000-0000-000000000000',
    'new_circular',
    'New Safety Circular Available',
    'A new safety circular "Enhanced Safety Procedures" has been published. Please review and acknowledge.',
    'medium',
    '/circulars',
    'View Circular',
    '2024-12-25'::timestamptz
),
(
    '00000000-0000-0000-0000-000000000000',
    'travel_reminder',
    'Flight Departure Reminder',
    'You have a flight departing tomorrow at 14:30 from Singapore International Airport.',
    'high',
    '/dashboard',
    'View Schedule',
    '2024-12-01'::timestamptz
);
*/
