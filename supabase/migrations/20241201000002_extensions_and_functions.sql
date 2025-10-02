-- Migration: Database Extensions and Utility Functions
-- Description: Additional extensions, functions, and database utilities for the Seafarer system
-- Created: 2024-12-01
-- Version: 1.0

-- =============================================================================
-- ADDITIONAL EXTENSIONS
-- =============================================================================

-- Enable text search for better search functionality
create extension if not exists "pg_trgm";

-- Enable full text search
create extension if not exists "unaccent";

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to automatically update certificate status based on expiry date
create or replace function update_certificate_status()
returns trigger as $$
begin
    -- Update status to 'expired' if expiry date has passed
    if new.expiry_date < current_date then
        new.status = 'expired';
        new.reminder_sent = false; -- Reset reminder flag for expired certificates
    -- Update status to 'pending_renewal' if expiry is within 30 days
    elsif new.expiry_date <= current_date + interval '30 days' and new.status = 'valid' then
        new.status = 'pending_renewal';
    -- Ensure status is 'valid' if expiry date is more than 30 days away
    elsif new.expiry_date > current_date + interval '30 days' then
        new.status = 'valid';
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update certificate status
create trigger trigger_update_certificate_status 
    before insert or update on certificates 
    for each row execute procedure update_certificate_status();

-- Function to automatically set completed_at when signoff checklist item is completed
create or replace function set_checklist_completed_at()
returns trigger as $$
begin
    if new.is_completed = true and old.is_completed = false then
        new.completed_at = now();
    elsif new.is_completed = false then
        new.completed_at = null;
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Trigger for signoff checklist completion timestamps
create trigger trigger_set_checklist_completed_at
    before update on signoff_checklist_items
    for each row execute procedure set_checklist_completed_at();

-- Function to automatically set actual_signoff_date when assignment is completed
create or replace function set_assignment_signoff_date()
returns trigger as $$
begin
    if new.status = 'completed' and old.status != 'completed' then
        new.actual_signoff_date = current_date;
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Trigger for assignment completion signoff date
create trigger trigger_set_assignment_signoff_date
    before update on assignments
    for each row execute procedure set_assignment_signoff_date();

-- Function to create notifications for various events
create or replace function create_notification(
    target_user_id uuid,
    notification_type notification_type,
    notification_title varchar(200),
    notification_message text,
    notification_link varchar(500) default null
)
returns uuid as $$
declare
    notification_id uuid;
begin
    insert into notifications (
        user_id,
        type,
        title,
        message,
        link
    ) values (
        target_user_id,
        notification_type,
        notification_title,
        notification_message,
        notification_link
    ) returning id into notification_id;
    
    return notification_id;
end;
$$ language plpgsql;

comment on function create_notification is 'Utility function to create notifications for users';

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for active assignments with vessel and user details
create view active_assignments as
select 
    a.id,
    a.user_id,
    a.vessel_id,
    a.join_date,
    a.expected_signoff_date,
    a.actual_signoff_date,
    a.status,
    a.contract_reference,
    v.vessel_name,
    v.vessel_type,
    v.flag,
    p.rank,
    p.employee_id
from assignments a
join vessels v on a.vessel_id = v.id
join profiles p on a.user_id = p.id
where a.status = 'active';

comment on view active_assignments is 'View of currently active assignments with related data';

-- View for certificates expiring within 30 days
create view certificates_expiring as
select 
    c.id,
    c.user_id,
    c.certificate_type,
    c.certificate_name,
    c.issue_date,
    c.expiry_date,
    c.status,
    c.reminder_sent,
    p.employee_id,
    p.rank
from certificates c
join profiles p on c.user_id = p.id
where c.expiry_date <= current_date + interval '30 days'
and c.status in ('valid', 'pending_renewal')
order by c.expiry_date asc;

comment on view certificates_expiring is 'View of certificates expiring within 30 days for reminder purposes';

-- View for user statistics
create view user_stats as
select 
    p.id,
    p.employee_id,
    p.rank,
    count(distinct a.id) as total_assignments,
    count(distinct case when a.status = 'active' then a.id end) as active_assignments,
    count(distinct c.id) as total_certificates,
    count(distinct case when c.status = 'valid' then c.id end) as valid_certificates,
    count(distinct case when c.expiry_date <= current_date + interval '30 days' then c.id end) as expiring_certificates
from profiles p
left join assignments a on p.id = a.user_id
left join certificates c on p.id = c.user_id
group by p.id, p.employee_id, p.rank;

comment on view user_stats is 'Statistical view of user assignments and certificates';

-- =============================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================================================

-- Composite indexes for better performance on common queries
create index idx_assignments_user_status_date on assignments(user_id, status, join_date);
create index idx_certificates_user_status_expiry on certificates(user_id, status, expiry_date);
create index idx_notifications_user_unread on notifications(user_id, is_read, created_at);

-- Text search indexes
create index idx_ports_fulltext on ports using gin(to_tsvector('english', port_name || ' ' || country));
create index idx_circulars_fulltext on circulars using gin(to_tsvector('english', title || ' ' || content));

-- =============================================================================
-- SAMPLE DATA FOR TESTING (Optional - Remove in production)
-- =============================================================================

-- Insert sample vessel types
insert into vessels (vessel_name, vessel_type, imo_number, flag) values
('Ocean Explorer', 'Container Ship', 'IMO1234567', 'Liberia'),
('Pacific Star', 'Bulk Carrier', 'IMO2345678', 'Panama'),
('Atlantic Breeze', 'Oil Tanker', 'IMO3456789', 'Marshall Islands'),
('Sea Spirit', 'Chemical Tanker', 'IMO4567890', 'Bahamas');

comment on table vessels is 'Registry of all vessels managed by the system with geographic and operational details';
