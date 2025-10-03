# WaveSync API Documentation

This directory contains the complete API structure for WaveSync, including routes, server actions, validation schemas, error handling, and client utilities.

## Directory Structure

```
src/
├── app/api/v1/           # API Routes (Version 1)
├── lib/actions/          # Server Actions
├── lib/api/              # API Utilities
│   ├── types.ts          # TypeScript types
│   ├── validation.ts     # Zod validation schemas
│   ├── errors.ts         # Custom error classes
│   └── client.ts         # API client wrapper
└── middleware/api-middleware.ts  # API middleware
```

## API Routes

### Authentication (`/api/v1/auth`)
- `POST /login` - User login
- `POST /signup` - User registration
- `POST /logout` - User logout
- `POST /refresh` - Token refresh
- `POST /password-reset` - Request password reset
- `PUT /password-reset` - Update password with token

### Certificates (`/api/v1/certificates`)
- `GET /` - List certificates with filters and pagination
- `POST /` - Create new certificate
- `GET /:id` - Get specific certificate
- `PUT /:id` - Update certificate
- `DELETE /:id` - Delete certificate
- `POST /:id/upload` - Upload certificate file

### Documents (`/api/v1/documents`)
- `GET /` - List documents with filters and pagination
- `POST /` - Create document metadata
- `GET /search` - Search documents
- `GET /:id` - Get specific document
- `PUT /:id` - Update document metadata
- `DELETE /:id` - Delete document
- `POST /upload` - Upload document file

### Notifications (`/api/v1/notifications`)
- `GET /` - List notifications with filters and pagination
- `POST /` - Create notification (admin only)
- `PATCH /` - Mark all notifications as read
- `GET /:id` - Get specific notification
- `PATCH /:id` - Mark notification as read
- `DELETE /:id` - Delete notification

### Weather (`/api/v1/weather`)
- `GET /` - Get current weather for coordinates
- `POST /` - Get weather forecast with custom parameters

### Export (`/api/v1/export`)
- `POST /` - Generate reports (PDF, CSV, Excel)
- `GET /` - Get export history

## Server Actions

Located in `/lib/actions/`, these server-side functions can be called directly from components:

### Auth Actions (`auth-actions.ts`)
- `loginAction()` - Handle login form submission
- `signupAction()` - Handle signup form submission
- `logoutAction()` - Handle logout
- `passwordResetRequestAction()` - Request password reset
- `passwordUpdateAction()` - Update password
- `checkAuthStatus()` - Check authentication status

### Certificate Actions (`certificate-actions.ts`)
- `createCertificateAction()` - Create certificate from form data
- `updateCertificateAction()` - Update certificate
- `deleteCertificateAction()` - Delete certificate
- `uploadCertificateFileAction()` - Upload certificate file

### Circular Actions (`circular-actions.ts`)
- `acknowledgeCircularAction()` - Acknowledge circular
- `markCircularAsReadAction()` - Mark as read
- `markAllCircularsAsReadAction()` - Mark all as read
- `getCircularAcknowledgmentStatus()` - Get acknowledgment status

### Profile Actions (`profile-actions.ts`)
- `updateProfileAction()` - Update user profile
- `uploadAvatarAction()` - Upload avatar image
- `deleteAvatarAction()` - Remove avatar
- `getProfileAction()` - Get profile data

### Notification Actions (`notification-actions.ts`)
- `markNotificationAsReadAction()` - Mark notification as read
- `deleteNotificationAction()` - Delete notification
- `markAllNotificationsAsReadAction()` - Mark all as read
- `getNotificationCountAction()` - Get unread count
- `getNotificationsAction()` - Paginated notifications
- `createNotificationAction()` - Create notification (admin)

### Signoff Actions (`signoff-actions.ts`)
- `updateSignoffChecklistAction()` - Update checklist item
- `updateSignoffProgressAction()` - Update progress percentage
- `submitSignoffAction()` - Submit completed checklist
- `getSignoffChecklistAction()` - Get checklist data
- `getUserSignoffChecksAction()` - Get all user checklists

## API Features

### Authentication & Authorization
- JWT-based authentication via Supabase
- Role-based access control (seafarer, admin)
- Request authentication middleware
- Token validation and refresh

### Rate Limiting
- Endpoint-specific rate limits
- Authentication rate limiting (login, signup)
- Upload rate limiting
- Export rate limiting
- Configurable limits per user role

### Validation
- Zod schema validation for all inputs
- Type-safe request/response handling
- Consistent error messages
- File upload validation

### Error Handling
- Custom error classes (`ApiError`, `ValidationError`, etc.)
- Consistent error response format
- Logging for debugging
- Graceful error recovery

### Response Format
All API responses follow this structure:
```json
{
  "success": true|false,
  "data": any,
  "message": "string",
  "error": "string",
  "timestamp": "ISO string",
  "statusCode": number,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number,
    "hasNext": boolean,
    "hasPrev": boolean
  }
}
```

### CORS Configuration
- Configurable allowed origins
- Preflight request handling
- Credential support
- Security headers

## Usage Examples

### Using Server Actions in Components
```tsx
import { createCertificateAction } from '@/lib/actions/certificate-actions';

export default function CertificateForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createCertificateAction(formData);
    if (result.success) {
      // Handle success
      toast.success(result.message);
    } else {
      // Handle error
      toast.error(result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Using API Client
```tsx
import { api } from '@/lib/api/client';

async function fetchCertificates() {
  try {
    const response = await api.get('/certificates');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch certificates:', error);
  }
}
```

### Direct API Calls
```tsx
const response = await fetch('/api/v1/certificates', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

## Environment Variables

Required environment variables for API functionality:

```env
NEXT_PUBLIC_API_BASE_URL=/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEATHER_API_KEY=your_openweather_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Middleware Features

### Authentication Middleware
- JWT token validation
- User role verification
- Automatic user context injection

### Rate Limiting Middleware
- IP-based rate limiting
- Endpoint-specific limits
- Automatic retry-after headers

### Logging Middleware
- Request/response logging
- Performance timing
- Error tracking
- Security auditing

### CORS Middleware
- Configurable origins
- Preflight handling
- Security headers

## Security Features

1. **Authentication**: JWT-based with refresh tokens
2. **Authorization**: Role-based access control
3. **Rate Limiting**: Prevents abuse and DoS attacks
4. **Input Validation**: All inputs validated with Zod schemas
5. **CORS**: Controlled cross-origin access
6. **Error Handling**: No sensitive data in error responses
7. **File Upload**: Size and type validation
8. **SQL Injection**: Protected via Supabase parameterized queries

## Testing

The API can be tested using:
- Built-in API routes (accessible via HTTP clients)
- Server actions (direct function calls)
- Integration tests
- Load testing for rate limits

## Deployment Considerations

1. **Environment Variables**: Ensure all required env vars are set
2. **Rate Limiting Storage**: Configure Redis or similar for production
3. **File Storage**: Configure Supabase Storage buckets
4. **Logging**: Set up proper logging infrastructure
5. **Monitoring**: Configure API monitoring and alerting
6. **Backup**: Regular database backups
7. **SSL**: Ensure HTTPS in production

## Future Enhancements

1. **API Versioning**: Support for multiple API versions
2. **Webhooks**: Event-driven notifications
3. **Caching**: Response caching for better performance
4. **GraphQL**: Alternative API interface
5. **Real-time**: WebSocket support for live updates
6. **Analytics**: API usage analytics
7. **Documentation**: Swagger/OpenAPI documentation generation



