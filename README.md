# WaveSync v1

A modern Next.js 14 application with Supabase integration for maritime operations management.

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Supabase** for backend services and authentication
- **Tailwind CSS** for responsive design
- **ESLint & Prettier** for code quality
- **Server Components** enabled by default
- **Authentication** middleware with route protection

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard routes
│   ├── (authenticated)/          # Protected routes group
│   │   ├── tickets/             # Ticket management
│   │   ├── certificates/         # Certificate tracking
│   │   ├── ports/                # Port operations
│   │   ├── circulars/            # Circular management
│   │   ├── signoff/              # Sign-off workflows
│   │   ├── documents/            # Document management
│   │   └── profile/              # User profile
│   ├── api/                      # API routes
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # Reusable UI components
│   └── shared/                   # Shared components
├── lib/
│   └── supabase/                 # Supabase clients
│       ├── client.ts             # Browser client
│       ├── server.ts             # Server-side client
│       └── middleware.ts          # Auth middleware
├── hooks/                        # Custom React hooks
├── types/
│   └── supabase.ts               # Database type definitions
├── utils/                        # Utility functions
└── supabase/                     # Database migrations and config
    ├── migrations/               # SQL migration files
    ├── config.toml              # Supabase configuration
    └── README.md                # Database documentation
```

## 🛠️ Setup

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wavesyncv1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment setup:
   ```bash
   cp env.example .env.local
   ```

4. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. Set up the database:
   ```bash
   # Initialize Supabase locally (optional)
   supabase init
   supabase start
   
   # Apply migrations to your Supabase project
   supabase db push
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Supabase Configuration

### Database Schema

The application features a comprehensive maritime operations database with 12 core tables:

#### Core Entities
- **profiles** - Extended seafarer profiles with professional data
- **vessels** - Vessel registry with IMO numbers and specifications  
- **assignments** - Seafarer assignments to vessels with contracts
- **certificates** - Professional certifications with expiry tracking

#### Operations Management
- **tickets** - Travel bookings for crew changes
- **ports** - Global port database with coordinates and agents
- **port_agents** - Local service providers and contacts
- **circulars** - Company announcements and communications
- **circular_acknowledgments** - User read confirmations

#### Workflow Systems
- **signoff_checklist_items** - Structured vessel signoff processes
- **documents** - Personal document storage and management
- **notifications** - In-app notification system

#### Key Features
- ✅ Complete Row Level Security (RLS) implementation
- ✅ Automatic status updates and timestamp management
- ✅ Performance-optimized indexes and views
- ✅ Comprehensive foreign key relationships
- ✅ Data validation through constraints and enums

### Authentication

Authentication is handled through Supabase Auth with:
- Server-side authentication validation
- Middleware for route protection
- Automatic session management

## 📱 Responsive Design

The application is built with mobile-first design principles using Tailwind CSS:
- Responsive breakpoints for mobile, tablet, and desktop
- Touch-friendly interfaces
- Optimized layouts for different screen sizes

## 🔧 Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Code Quality

- **ESLint** with Next.js and TypeScript configurations
- **Prettier** for code formatting
- TypeScript strict mode enabled

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your preferred平台上 (Vercel, Netlify, etc.)

3. Set environment variables in your deployment platform

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.