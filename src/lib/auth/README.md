# Authentication System

Complete authentication system for the WaveSync Seafarer application using Supabase Auth.

## 📁 Structure

```
src/lib/auth/
├── session.ts          # Session management utilities
├── actions.ts          # Server actions for auth operations
├── validation.ts       # Zod schemas for form validation
└── README.md          # This documentation

src/components/auth/
├── AuthLayout.tsx     # Shared layout for auth pages
├── LoginForm.tsx      # Login form component
├── SignUpForm.tsx     # Registration form component
├── ProtectedRoute.tsx  # Route protection HOC
└── LogoutButton.tsx    # Logout functionality

src/app/auth/
├── login/             # Login page
├── signup/            # Registration page
├── forgot-password/   # Password reset request
├── reset-password/    # Password reset form
├── complete-profile/  # Profile completion page
└── callback/          # OAuth callback handler
```

## 🔐 Features

### Authentication Methods
- ✅ Email/Password authentication
- ✅ Password reset with email links
- ✅ Remember me functionality
- ✅ Session persistence
- ✅ Automatic token refresh

### Security Features
- ✅ Row Level Security (RLS) integration
- ✅ Server-side authentication validation
- ✅ Client-side session management
- ✅ Protected routes and middleware
- ✅ CSRF protection via Supabase

### User Experience
- ✅ Form validation with Zod schemas
- ✅ Loading states and error handling
- ✅ Responsive design for mobile/desktop
- ✅ Accessible form components
- ✅ Success/error feedback

## 🚀 Usage

### Protected Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Session Management

```tsx
import { getCurrentUser, getCurrentUserWithProfile } from '@/lib/supabase/server';

export default async function MyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Handle unauthenticated state
  }

  const userWithProfile = await getCurrentUserWithProfile();
  
  if (!userWithProfile?.profile) {
    // Redirect to profile completion
  }

  return <div>Authenticated content</div>;
}
```

### Authentication Actions

```tsx
import { signIn, signUp, requestPasswordReset } from '@/lib/auth/actions';

// Server action for login
const result = await signIn({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true,
});

if (result.success) {
  // Redirect to dashboard
} else {
  // Handle error
  console.error(result.error);
}
```

### Form Validation

```tsx
import { loginSchema, type LoginFormData } from '@/lib/auth/validation';

const handleSubmit = async (data: LoginFormData) => {
  // Validate form data
  const validatedData = loginSchema.parse(data);
  
  // Proceed with authentication
  const result = await signIn(validatedData);
};
```

## 📋 Pages

### `/auth/login`
- Email/password login form
- Remember me checkbox
- Forgot password link
- Demo credentials provided

### `/auth/signup`
- Complete registration form
- Employee information collection
- Emergency contact (optional)
- Password strength requirements
- Email validation

### `/auth/forgot-password`
- Email input for password reset
- Success confirmation
- Redirect guidance

### `/auth/reset-password`
- New password creation
- Password confirmation
- Strength requirements
- Success feedback

### `/auth/complete-profile`
- Profile completion prompt
- Contact admin instructions
- User email display

## 🛠️ Configuration

### Environment Variables

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Middleware Configuration

The middleware in `middleware.ts` handles:
- Session validation
- Route protection
- Automatic redirects

Matcher configuration excludes:
- Static files
- API routes
- Auth callback routes
- Image assets

### Supabase Setup

1. Enable email authentication in Supabase dashboard
2. Configure email templates
3. Set up redirect URLs
4. Configure Row Level Security policies

## 🔒 Security Considerations

### Password Security
- Minimum 6 characters (configurable via Supabase)
- Uppercase/language lowercase letter requirement
- Number requirement
- Client and server-side validation

### Session Security
- HTTP-only cookies via Supabase
- Automatic token refresh
- CSRF protection
- Secure cookie settings in production

### Route Protection
- Server-side authentication checks
- Middleware validation
- Automatic redirects
- Profile completion enforcement

## 🎨 Styling

The authentication system uses:
- **Tailwind CSS** for styling
- **Clean, professional design**
- **Responsive layouts**
- **Accessibility features**

Components follow:
- Design system patterns
- Color scheme consistency
- Typography standards
- Interactive state styling

## 🧪 Testing

### Demo Credentials
For testing purposes, use:
- **Email:** demo@wavesync.com
- **Password:** demo123

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Password reset flow
- [ ] Registration flow
- [ ] Profile completion
- [ ] Session persistence
- [ ] Logout functionality
- [ ] Protected route access

## 📱 Mobile Support

The authentication system is fully responsive:
- Touch-friendly form inputs
- Optimized layouts for small screens
- Mobile navigation patterns
- Accessibility compliance

## 🔄 State Management

Authentication state is managed through:
- **Server components** for initial auth check
- **Client components** for interactive forms
- **Supabase Auth** for session persistence
- **Next.js redirects** for route protection

## 📈 Performance

Optimizations include:
- Server-side session validation
- Efficient database queries
- Minimal client-side JavaScript
- Optimized bundle sizes
- Client-side caching via Supabase

## 🚨 Error Handling

Comprehensive error handling for:
- Network connectivity issues
- Invalid credentials
- Server-side validation errors
- Supabase service errors
- Form validation failures

Error states provide:
- User-friendly messages
- Recovery suggestions
- Technical details for debugging
- Graceful degradation

## 🔧 Customization

### Adding New Auth Methods
1. Update `actions.ts` with new auth methods
2. Add validation schemas in `validation.ts`
3. Create form components
4. Update middleware configuration

### Customizing Validation
Modify Zod schemas in `validation.ts`:
- Field requirements
- Error messages
- Custom validation rules
- Data transformations

### Styling Customization
Update `AuthLayout.tsx` components:
- Color schemes
- Layout patterns
- Component variants
- Responsive breakpoints

## 📞 Support

For authentication-related issues:
1. Check Supabase dashboard logs
2. Verify environment variables
3. Test with demo credentials
4. Review middleware configuration
5. Check browser console for client errors

## 🔮 Future Enhancements

Planned improvements:
- OAuth providers (Google, GitHub)
- Multi-factor authentication
- Passwordless login
- Admin user management
- Account verification flow
- Advanced security settings
