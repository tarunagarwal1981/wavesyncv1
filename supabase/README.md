# Seafarer Database Schema

This directory contains the complete database schema and migrations for the WaveSync Seafarer application.

## 📁 Structure

```
supabase/
├── migrations/
│   ├── 20241201000001_initial_seafarer_schema.sql   # Main schema with all tables
│   ├── 20241201000002_extensions_and_functions.sql # Functions, triggers, and views
│   └── 20241201000003_seed_data.sql                # Development seed data
├── config.toml                                       # Supabase configuration
└── README.md                                        # This file
```

## 🗃️ Database Schema Overview

### Core Tables

1. **profiles** - Extended user profiles with seafarer-specific data
2. **vessels** - Vessel registry with IMO numbers and details  
3. **assignments** - Seafarer vessel assignments and contracts
4. **certificates** - Professional certifications and validity tracking
5. **tickets** - Travel bookings for crew changes
6. **ports** - Global port database with coordinates
7. **port_agents** - Contact information for port services
8. **circulars** - Company announcements and circulars
9. **circular_acknowledgments** - User read confirmations
10. **signoff_checklist_items** - Vessel signoff process checklists
11. **documents** - Personal document storage
12. **notifications** - In-app notification system

### Key Features

- ✅ **Row Level Security (RLS)** - Secure access policies for all tables
- ✅ **Foreign Key Relationships** - Proper referential integrity
- ✅ **Performance Indexes** - Optimized queries for common operations
- ✅ **Automatic Timestamps** - Created/updated triggers
- ✅ **Data Validation** - Check constraints and enums
- ✅ **Utility Functions** - Helper functions for common operations
- ✅ **Database Views** - Simplified query interfaces

## 🚀 Getting Started

### Prerequisites

- Supabase CLI installed
- PostgreSQL 15+ (for local development)

### Running Migrations

1. **Initialize Supabase project:**
   ```bash
   supabase init
   ```

2. **Start local development:**
   ```bash
   supabase start
   ```

3. **Run migrations:**
   ```bash
   supabase db reset
   ```

4. **Apply to remote database:**
   ```bash
   supabase db push
   ```

### Environment Setup

Create `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Tables Documentation

### Profiles Table
- **Purpose**: Extended user profiles for seafarers
- **Key Fields**: employee_id, rank, nationality, emergency_contact
- **RLS**: Users access only their own profile

### Vessels Table
- **Purpose**: Registry of all vessels in the system
- **Key Fields**: vessel_name, imo_number, flag, coordinates
- **RLS**: Readable by all authenticated users

### Assignments Table
- **Purpose**: Tracks seafarer assignments to vessels
- **Key Fields**: join_date, signoff_dates, status, contract_reference
- **RLS**: Users access only their own assignments

### Certificates Table
- **Purpose**: Professional certifications and expiry management
- **Key Fields**: certificate_type, expiry_date, issuing_authority
- **RLS**: Users access only their own certificates
- **Automation**: Auto-updates status based on expiry dates

### Tickets Table
- **Purpose**: Travel arrangements for crew changes
- **Key Fields**: booking details, flight information, booking_reference
- **RLS**: Users access only their own tickets

### Ports & Port Agents
- **Purpose**: Global port database with agent contacts
- **Key Fields**: unlocode, coordinates, services, operating_hours
- **RLS**: Readable by all authenticated users

### Circulars & Acknowledgments
- **Purpose**: Company communications with read tracking
- **Key Fields**: title, category, priority, requires_acknowledgment
- **RLS**: Readable by all users, acknowledgments user-specific

### Signoff Checklist
- **Purpose**: Structured vessel signoff process
- **Key Fields**: item_text, category, completion status, notes
- **RLS**: Users access only their own checklist items

### Documents & Notifications
- **Purpose**: File storage and user notifications
- **RLS**: Users access only their own documents/notifications

## 🔧 Custom Functions

### Automatic Updates
- `update_certificate_status()` - Auto-updates certificate status
- `set_checklist_completed_at()` - Sets completion timestamps
- `set_assignment_signoff_date()` - Records actual signoff dates
- `update_updated_at_column()` - Updates modified timestamps

### Utility Functions
- `create_notification()` - Helper for creating notifications

## 📈 Performance Optimizations

### Primary Indexes
- User ID indexes on all user-related tables
- Date indexes for efficient range queries
- Status indexes for filtering operations
- Composite indexes for complex queries

### Database Views
- `active_assignments` - Active assignments with joins
- `certificates_expiring` - Certificates nearing expiry
- `user_stats` - User statistics summary

## 🔒 Security Features

### Row Level Security Policies
- Users can only access their own data
- Admin/system access for global data
- Proper foreign key constraints
- Data validation through check constraints

### Data Protection
- Automatic timestamp updates
- Soft delete capabilities (archive flags)
- Structured JSON fields for flexible data
- Enum types for data consistency

## 🧪 Development Data

The seed data migration includes:
- Sample ports (Singapore, Hamburg, Los Angeles, etc.)
- Port agent contacts with services
- Sample circulars for testing
- Utility functions for development

⚠️ **Production Note**: Remove or modify seed data before production deployment.

## 🚨 Important Notes

### Production Considerations
1. Replace placeholder user IDs (`00000000-0000-0000-0000-000000000000`) with real admin users
2. Remove sensitive seed data before production
3. Review and adjust RLS policies for your security requirements
4. Add additional indexes based on query patterns
5. Set up automated backups and monitoring

### Known Limitations
- Circular acknowledgments require manual implementation of acknowledgment flow
- Notification system needs application-level scheduling for automated alerts
- File storage URLs need to be managed through Supabase Storage or external CDN

## 📞 Support

For database-related issues:
1. Check Supabase logs: `supabase logs`
2. Review migration status: `supabase migration list`
3. Reset local database: `supabase db reset`

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Optimization](https://supabase.com/docs/guides/database)


