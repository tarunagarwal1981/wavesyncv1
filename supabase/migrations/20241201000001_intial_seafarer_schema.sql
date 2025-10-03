-- Migration: Initial Seafarer Database Schema
-- Description: Creates all tables, relationships, RLS policies, indexes, and triggers for the Seafarer management system
-- Created: 2024-12-01
-- Version: 1.0

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Custom enum types
create type assignment_status as enum ('active', 'completed', 'cancelled');
create type certificate_status as enum ('valid', 'expired', 'revoked', 'pending_renewal');
create type ticket_type as enum ('flight', 'hotel', 'transport', 'visa');
create type circular_category as enum ('safety', 'operation', 'administrative', 'crew_change');
create type priority_level as enum ('low', 'medium', 'high', 'urgent');
create type document_type as enum ('certificate', 'contract', 'medical', 'passport', 'other');
create type notification_type as enum ('assignment', 'certificate', 'circular', 'system');

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================
-- Extends auth.users with additional seafarer-specific information
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    employee_id varchar(50) unique not null,
    rank varchar(100) not null,
    nationality varchar(100) not null,
    phone varchar(20),
    emergency_contact jsonb, -- {name: string, phone: string, relationship: string}
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table profiles is 'Extended user profiles for seafarers with additional metadata';
comment on column profiles.employee_id is 'Unique employee identification number';
comment on column profiles.rank is 'Professional rank/position (Captain, Engineer, etc.)';
comment on column profiles.nationality is 'Seafarer nationality for compliance';
comment on column profiles.emergency_contact is 'JSON object with emergency contact details';

-- =============================================================================
-- VESSELS TABLE
-- =============================================================================
-- Registry of all vessels in the system
create table vessels (
    id uuid primary key default uuid_generate_v4(),
    vessel_name varchar(200) not null,
    vessel_type varchar(100) not null,
    imo_number varchar(15) unique not null,
    flag varchar(100) not null,
    created_at timestamptz default now()
);

comment on table vessels is 'Registry of all vessels managed by the system';
comment on column vessels.imo_number is 'International Maritime Organization number (unique vessel identifier)';
comment on column vessels.flag is 'Flag state of the vessel';

-- =============================================================================
-- ASSIGNMENTS TABLE
-- =============================================================================
-- Tracks seafarer assignments to vessels with contract dates
create table assignments (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    vessel_id uuid not null references vessels(id) on delete restrict,
    join_date date not null,
    expected_signoff_date date,
    actual_signoff_date date,
    status assignment_status default 'active' not null,
    contract_reference varchar(100),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    -- Constraints
    check (expected_signoff_date is null or expected_signoff_date >= join_date),
    check (actual_signoff_date is null or actual_signoff_date >= join_date)
);

comment on table assignments is 'Seafarer vessel assignments with contract periods';
comment on column assignments.join_date is 'Date seafarer joined the vessel';
comment on column assignments.expected_signoff_date is 'Originally planned signoff date';
comment on column assignments.actual_signoff_date is 'Actual date of signoff';
comment on column assignments.contract_reference is 'Reference number for the employment contract';

-- =============================================================================
-- CERTIFICATES TABLE
-- =============================================================================
-- Manages seafarer certifications and their validity periods
create table certificates (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    certificate_type varchar(100) not null,
    certificate_name varchar(200) not null,
    issue_date date not null,
    expiry_date date not null,
    issuing_authority varchar(200) not null,
    certificate_number varchar(100) not null,
    document_url text,
    status certificate_status default 'valid' not null,
    reminder_sent boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    -- Constraints
    check (expiry_date > issue_date),
    unique (user_id, certificate_type, certificate_number),
    check (status in ('valid', 'expired', 'revoked', 'pending_renewal'))
);

comment on table certificates is 'Seafarer professional certificates and qualifications';
comment on column certificates.certificate_type is 'Type of certificate (STCW, Medical, etc.)';
comment on column certificates.certificate_name is 'Official name of the certificate';
comment on column certificates.issuing_authority is 'Organization that issued the certificate';
comment on column certificates.reminder_sent is 'Whether expiry reminder has been sent';

-- =============================================================================
-- TICKETS TABLE
-- =============================================================================
-- Travel booking information for crew changes
create table tickets (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    assignment_id uuid references assignments(id) on delete set null,
    ticket_type ticket_type not null,
    booking_reference varchar(100),
    departure_airport varchar(10),
    arrival_airport varchar(10),
    departure_datetime timestamptz,
    arrival_datetime timestamptz,
    airline varchar(100),
    flight_number varchar(20),
    seat_number varchar(20),
    document_url text,
    created_at timestamptz default now(),
    
    -- Constraints
    check (departure_datetime is null or arrival_datetime is null or arrival_datetime >= departure_datetime)
);

comment on table tickets is 'Travel bookings and arrangements for crew changes';
comment on column tickets.assignment_id is 'Associated vessel assignment (nullable for general travel)';
comment on column tickets.booking_reference is 'External booking reference number';
comment on column tickets.departure_airport is 'IATA airport code for departure';
comment on column tickets.arrival_airport is 'IATA airport code for arrival';

-- =============================================================================
-- PORTS TABLE
-- =============================================================================
-- Global registry of ports with geographical information
create table ports (
    id uuid primary key default uuid_generate_v4(),
    port_name varchar(200) not null,
    country varchar(100) not null,
    unlocode varchar(5) unique,
    timezone varchar(50),
    latitude decimal(10, 8),
    longitude decimal(11, 8),
    created_at timestamptz default now(),
    
    -- Constraints
    check (latitude >= -90 and latitude <= 90),
    check (longitude >= -180 and longitude <= 180)
);

comment on table ports is 'Global registry of ports and terminals';
comment on column ports.unlocode is 'UN/LOCODE - United Nations location code';
comment on column ports.timezone is 'IANA timezone identifier';

-- =============================================================================
-- PORT_AGENTS TABLE
-- =============================================================================
-- Contact information for port agents at various locations
create table port_agents (
    id uuid primary key default uuid_generate_v4(),
    port_id uuid not null references ports(id) on delete cascade,
    company_name varchar(200) not null,
    contact_person varchar(200),
    phone varchar(20),
    email varchar(200) not null,
    services text[], -- Array of services provided
    operating_hours jsonb, -- {business_hours: {daily: {...}, weekends: {...}}}
    created_at timestamptz default now()
);

comment on table port_agents is 'Port agent contacts and service information';
comment on column port_agents.services is 'Array of services provided by the agent';
comment on column port_agents.operating_hours is 'JSON object with detailed operating hours';

-- =============================================================================
-- CIRCULARS TABLE
-- =============================================================================
-- Company circulars and announcements
create table circulars (
    id uuid primary key default uuid_generate_v4(),
    title varchar(300) not null,
    reference_number varchar(100) unique,
    category circular_category not null,
    priority priority_level default 'medium' not null,
    issue_date date not null,
    content text not null,
    attachments jsonb, -- Array of attachment URLs/metadata
    published_by uuid not null references auth.users(id) on delete restrict,
    requires_acknowledgment boolean default false,
    created_at timestamptz default now()
);

comment on table circulars is 'Company circulars and communications';
comment on column circulars.content is 'Main content/body of the circular';
comment on column circulars.attachments is 'JSON array of file attachments';
comment on column circulars.published_by is 'User who created/published the circular';
comment on column circulars.requires_acknowledgment is 'Whether users must acknowledge reading';

-- =============================================================================
-- CIRCULAR_ACKNOWLEDGMENTS TABLE
-- =============================================================================
-- Tracks user acknowledgments of circulars
create table circular_acknowledgments (
    id uuid primary key default uuid_generate_v4(),
    circular_id uuid not null references circulars(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    read_at timestamptz,
    acknowledged_at timestamptz default now(),
    created_at timestamptz default now(),
    
    -- Constraints
    unique (circular_id, user_id)
);

comment on table circular_acknowledgments is 'User acknowledgments of circulars that require confirmation';
comment on column circular_acknowledgments.read_at is 'When the user read the circular';

-- =============================================================================
-- SIGNOFF_CHECKLIST_ITEMS TABLE
-- =============================================================================
-- Checklist items for vessel signoff process
create table signoff_checklist_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    assignment_id uuid not null references assignments(id) on delete cascade,
    item_text text not null,
    category varchar(100) not null,
    is_completed boolean default false not null,
    completed_at timestamptz,
    notes text,
    created_at timestamptz default now(),
    
    -- Constraints
    check ((is_completed = false and completed_at is null) or (is_completed = true and completed_at is not null))
);

comment on table signoff_checklist_items is 'Individual checklist items for vessel signoff process';
comment on column signoff_checklist_items.category is 'Category/section of the signoff checklist';
comment on column signoff_checklist_items.notes is 'Additional notes or comments';

-- =============================================================================
-- DOCUMENTS TABLE
-- =============================================================================
-- Document storage and management
create table documents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null REFERENCES auth.users(id) on delete cascade,
    document_type document_type not null,
    document_name varchar(200) not null,
    upload_date date default current_date not null,
    document_url text not null,
    tags text[], -- Array of tags for organization
    is_archived boolean default false not null,
    created_at timestamptz default now()
);

comment on table documents is 'User document storage and metadata';
comment on column documents.tags is 'Array of tags for document categorization';

-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================
-- In-app notifications for users
create table notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type notification_type not null,
    title varchar(200) not null,
    message text not null,
    link varchar(500), -- URL or route for navigation
    is_read boolean default false not null,
    created_at timestamptz default now(),
    
    -- Constraints
    check (type in ('assignment', 'certificate', 'circular', 'system'))
);

comment on table notifications is 'In-app notifications for users';
comment on column notifications.link is 'URL or internal route for notification action';

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Profiles indexes
create index idx_profiles_employee_id on profiles(employee_id);

-- Vessels indexes  
create index idx_vessels_imo on vessels(imo_number);
create index idx_vessels_flag on vessels(flag);

-- Assignments indexes
create index idx_assignments_user_id on assignments(user_id);
create index idx_assignments_vessel_id on assignments(vessel_id);
create index idx_assignments_status on assignments(status);
create index idx_assignments_dates on assignments(join_date, expected_signoff_date);

-- Certificates indexes
create index idx_certificates_user_id on certificates(user_id);
create index idx_certificates_expiry on certificates(expiry_date);
create index idx_certificates_status on certificates(status);
create index idx_certificates_type on certificates(certificate_type);

-- Tickets indexes
create index idx_tickets_user_id on tickets(user_id);
create index idx_tickets_assignment_id on tickets(assignment_id);
create index idx_tickets_type on tickets(ticket_type);
create index idx_tickets_dates on tickets(departure_datetime);

-- Ports indexes
create index idx_ports_unlocode on ports(unlocode);
create index idx_ports_country on ports(country);

-- Port agents indexes
create index idx_port_agents_port_id on port_agents(port_id);
create index idx_port_agents_email on port_agents(email);

-- Circulars indexes
create index idx_circulars_category on circulars(category);
create index idx_circulars_priority on circulars(priority);
create index idx_circulars_issue_date on circulars(issue_date);
create index idx_circulars_published_by on circulars(published_by);

-- Circular acknowledgments indexes
create index idx_circular_acknowledgments_circular_id on circular_acknowledgments(circular_id);
create index idx_circular_acknowledgments_user_id on circular_acknowledgments(user_id);

-- Signoff checklist indexes
create index idx_signoff_checklist_user_assignment on signoff_checklist_items(user_id, assignment_id);
create index idx_signoff_checklist_completed on signoff_checklist_items(is_completed);

-- Documents indexes
create index idx_documents_user_id on documents(user_id);
create index idx_documents_type on documents(document_type);
create index idx_documents_archived on documents(is_archived);

-- Notifications indexes
create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_read on notifications(is_read);
create index idx_notifications_type on notifications(type);
create index idx_notifications_created_at on notifications(created_at);

-- =============================================================================
-- TRIGGER FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- =============================================================================

-- Function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply update triggers
create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_assignments_updated_at before update on assignments for each row execute procedure update_updated_at_column();
create trigger update_certificates_updated_at before update on certificates for each row execute procedure update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table vessels enable row level security;
alter table assignments enable row level security;
alter table certificates enable row level security;
alter table tickets enable row level security;
alter table ports enable row level security;
alter table port_agents enable row level security;
alter table circulars enable row level security;
alter table circular_acknowledgments enable row level security;
alter table signoff_checklist_items enable row level security;
alter table documents enable row level security;
alter table notifications enable row level security;

-- Profiles policies
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- Vessels policies (readable by all authenticated users)
create policy "Authenticated users can view vessels" on vessels for select using (auth.role() = 'authenticated');

-- Assignments policies
create policy "Users can view their own assignments" on assignments for select using (auth.uid() = user_id);
create policy "Users can insert their own assignments" on assignments for insert with check (auth.uid() = user_id);
create policy "Users can update their own assignments" on assignments for update using (auth.uid() = user_id);

-- Certificates policies
create policy "Users can view their own certificates" on certificates for select using (auth.uid() = user_id);
create policy "Users can insert their own certificates" on certificates for insert with check (auth.uid() = user_id);
create policy "Users can update their own certificates" on certificates for update using (auth.uid() = user_id);

-- Tickets policies
create policy "Users can view their own tickets" on tickets for select using (auth.uid() = user_id);
create policy "Users can insert their own tickets" on tickets for insert with check (auth.uid() = user_id);
create policy "Users can update their own tickets" on tickets for update using (auth.uid() = user_id);

-- Ports policies (readable by all authenticated users)
create policy "Authenticated users can view ports" on ports for select using (auth.role() = 'authenticated');
create policy "Authenticated users can view port agents" on port_agents for select using (auth.role() = 'authenticated');

-- Circulars policies
create policy "Authenticated users can view circulars" on circulars for select using (auth.role() = 'authenticated');

-- Circular acknowledgments policies
create policy "Users can view their own acknowledgments" on circular_acknowledgments for select using (auth.uid() = user_id);
create policy "Users can insert acknowledgments for themselves" on circular_acknowledgments for insert with check (auth.uid() = user_id);
create policy "Users can update their own acknowledgments" on circular_acknowledgments for update using (auth.uid() = user_id);

-- Signoff checklist policies
create policy "Users can view their own checklist items" on signoff_checklist_items for select using (auth.uid() = user_id);
create policy "Users can insert checklist items for themselves" on signoff_checklist_items for insert with check (auth.uid() = user_id);
create policy "Users can update their own checklist items" on signoff_checklist_items for update using (auth.uid() = user_id);

-- Documents policies
create policy "Users can view their own documents" on documents for select using (auth.uid() = user_id);
create policy "Users can insert their own documents" on documents for insert with check (auth.uid() = user_id);
create policy "Users can update their own documents" on documents for update using (auth.uid() = user_id);

-- Notifications policies
create policy "Users can view their own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications" on notifications for update using (auth.uid() = user_id);

-- =============================================================================
-- INITIAL DATA SEEDING (Optional)
-- =============================================================================

-- Insert some sample ports (optional - remove if not needed)
insert into ports (port_name, country, unlocode, timezone, latitude, longitude) values
('Singapore Port', 'Singapore', 'SGSIN', 'Asia/Singapore', 1.2966, 103.7764),
('Hamburg Port', 'Germany', 'DEHAM', 'Europe/Berlin', 53.5511, 9.9937),
('Los Angeles Port', 'United States', 'USLAX', 'America/Los_Angeles', 33.7175, -118.2266),
('Dubai Port', 'United Arab Emirates', 'AEDUB', 'Asia/Dubai', 25.2612, 55.2759);

comment on table assignments is 'Seafarer vessel assignments with contract periods and signoff tracking';


