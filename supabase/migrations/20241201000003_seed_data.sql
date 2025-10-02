-- Migration: Seed Data for Development
-- Description: Initial seed data for development and testing purposes
-- Created: 2024-12-01
-- Version: 1.0

-- WARNING: This migration contains sample data for development only.
-- Do not run this in production or remove sensitive data before deployment.

-- =============================================================================
-- ADDITIONAL SAMPLE PORTS
-- =============================================================================

-- Expand the port database with more major maritime ports
insert into ports (port_name, country, unlocode, timezone, latitude, longitude) values
('Antwerp Port', 'Belgium', 'BEANR', 'Europe/Brussels', 51.2308, 4.4092),
('Rotterdam Port', 'Netherlands', 'NLRTM', 'Europe/Amsterdam', 51.9252, 4.4777),
('Long Beach Port', 'United States', 'USLGB', 'America/Los_Angeles', 33.7695, -118.1909),
('Busan Port', 'South Korea', 'KRPUS', 'Asia/Seoul', 35.0833, 128.8833),
('Bremen Port', 'Germany', 'DEBRV', 'Europe/Berlin', 53.0853, 8.7936),
('Barcelona Port', 'Spain', 'ESBCN', 'Europe/Madrid', 41.3644, 2.1747),

-- Asia Pacific
('Shanghai Port', 'China', 'CNSHA', 'Asia/Shanghai', 31.2304, 121.4737),
('Shenzhen Port', 'China', 'CNSNZ', 'Asia/Shanghai', 22.5430, 114.0579),
('Tokyo Port', 'Japan', 'JPTYO', 'Asia/Tokyo', 35.6762, 139.6503),
('Melbourne Port', 'Australia', 'AUMXA', 'Australia/Melbourne', -37.8519, 144.9018),

-- Middle East & Africa
('Port of Jebel Ali', 'United Arab Emirates', 'AEJEA', 'Asia/Dubai', 24.9874, 55.0287),
('Houston Port', 'United States', 'USHOU', 'America/Chicago', 29.7604, -95.3698),
('Mumbai Port', 'India', 'INMUM', 'Asia/Kolkata', 19.0760, 72.8777),
('Piraeus Port', 'Greece', 'GRPIR', 'Europe/Athens', 37.9755, 23.7348)
on conflict (unlocode) do nothing;

-- =============================================================================
-- SAMPLE PORT AGENTS
-- =============================================================================

-- Add sample port agents for major ports
insert into port_agents (port_id, company_name, contact_person, phone, email, services, operating_hours) 
select 
    p.id,
    agents.company_name,
    agents.contact_person,
    agents.phone,
    agents.email,
    agents.services,
    agents.operating_hours
from ports p,
(values 
    -- Singapore Port Agents
    ('Singapore Shipping Agency', 'Ms. Sarah Lim', '+65-6123-4567', 'sarah.lim@ssa.sg', array['Crew Change', 'Port Clearance', 'Immigration'], '{"weekdays": {"start": "09:00", "end": "17:00"}, "weekends": {"start": "10:00", "end": "16:00"}}'),
    ('Port Singapore Logistics', 'Mr. Raj Patel', '+65-6123-4568', 'raj.patel@psl.sg', array['Logistics', 'Equipment Supply', 'Bunker'], '{"weekdays": {"start": "08:00", "end": "18:00"}, "weekends": "closed"}'),
    
    -- Hamburg Port Agents  
    ('Hamburg Maritime Services', 'Herr Klaus Mueller', '+49-40-555-1234', 'klaus.mueller@hms.de', array['Crew Change', 'Port Clearance', 'Customs'], '{"weekdays": {"start": "08:30", "end": "17:30"}, "saturdays": {"start": "09:00", "end": "13:00"}}'),
    
    -- Los Angeles Port Agents
    ('Pacific Coast Agents', 'Ms. Maria Rodriguez', '+1-310-555-0123', 'maria.rodriguez@pca.com', array['Crew Change', 'Immigration', 'Customs', 'Transport'], '{"weekdays": {"start": "07:00", "end": "19:00"}, "weekends": "emergency_only"}')
) as agents(company_name, contact_person, phone, email, services, operating_hours)
where p.port_name in ('Singapore Port', 'Hamburg Port', 'Los Angeles Port')
limit 4;

-- =============================================================================
-- SAMPLE CIRCULARS
-- =============================================================================

-- Add sample circulars for testing (these will need a valid user_id in real implementation)
-- Note: You'll need to replace '00000000-0000-0000-0000-000000000000' with actual user IDs
insert into circulars (title, reference_number, category, priority, issue_date, content, published_by, requires_acknowledgment) values
('Monthly Safety Briefing - December 2024', 'SAF-DEC-2024-001', 'safety', 'high', '2024-12-01', 
 'This month''s safety briefing covers winter navigation procedures, ice avoidance protocols, and emergency response procedures for cold weather operations. All crew members must acknowledge receipt of this briefing within 48 hours.',
 '00000000-0000-0000-0000-000000000000', true),
 
('Crew Change Protocol Update', 'OPE-DEC-2024-002', 'operation', 'medium', '2024-12-01',
 'Updated procedures for crew changes at designated ports. Please review the new booking requirements and documentation checklist. Changes take effect immediately.',
 '00000000-0000-0000-0000-000000000000', false),
 
('STCW Training Requirements 2025', 'ADMIN-DEC-2024-003', 'administrative', 'high', '2024-12-01',
 'New STCW training requirements coming into effect January 2025. All certified officers must complete additional security training modules by March 31, 2025.',
 '00000000-0000-0000-0000-000000000000', true);

-- =============================================================================
-- CREATION OF APPLICATION README
-- =============================================================================

-- Create a summary view that shows the complete structure
create view database_documentation as
select 
    'Tables' as object_type,
    count(*) as object_count,
    string_agg(tablename, ', ') as object_names
from pg_tables 
where schemaname = 'public'
and tablename not like 'pg_%'
union all
select 
    'Views' as object_type,
    count(*) as object_count,
    string_agg(viewname, ', ') as object_names  
from pg_views 
where schemaname = 'public'
union all
select 
    'Functions' as object_type,
    count(*) as object_count,
    string_agg(routinename, ', ') as object_names
from information_schema.routines
where routine_schema = 'public';

comment on view database_documentation is 'Summary view of all database objects for documentation purposes';

-- =============================================================================
-- FINAL DATABASE STATISTICS
-- =============================================================================

-- Update table statistics for better query planning
analyze profiles;
analyze vessels;
analyze assignments;
analyze certificates;
analyze tickets;
analyze ports;
analyze port_agents;
analyze circulars;
analyze circular_acknowledgments;
analyze signoff_checklist_items;
analyze documents;
analyze notifications;

-- Log completion of seed data
insert into notifications (
    user_id,
    type,
    title,
    message,
    link
) values (
    '00000000-0000-0000-0000-000000000000', -- System user ID (replace in real implementation)
    'system',
    'Database Seeding Complete',
    'The Seafarer database has been populated with initial development data.',
    '/dashboard'
);

comment on table signoff_checklist_items is 'Individual checklist items for systematic vessel signoff process';

-- End of seed data migration
