import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { passwordResetSchema, passwordUpdateSchema } from '@/lib/api/validation';

// Password reset request handler
async function passwordResetRequestHandler(data: { email: string }) {
  try {
    const { email } = data;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      throw new Error('Password reset request failed');
    }

    return apiSuccess({ email }, 'Password reset email sent');
  } catch (error) {
    console.error('Password reset request error:', error);
    return apiError(error instanceof Error ? error : new Error('Password reset failed'), 400);
  }
}

// Password update handler
async function passwordUpdateHandler(data: { currentPassword: string; newPassword: string }) {
  try {
    const { currentPassword, newPassword } = data;

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error('Password update failed');
    }

    return apiSuccess({}, 'Password updated successfully');
  } catch (error) {
    console.error('Password update error:', error);
    return apiError(error instanceof Error ? error : new Error('Password update failed'), 400);
  }
}

// Create handlers with middleware
const requestHandler = createApiHandler(
  withValidation(passwordResetSchema, 'body')(passwordResetRequestHandler),
  {
    rateLimit: 3,
    endpoint: 'auth/password-reset',
  }
);

const updateHandler = createApiHandler(
  withValidation(passwordUpdateSchema, 'body')(passwordUpdateHandler),
  {
    requireAuth: true,
    rateLimit: 5,
  }
);

export { requestHandler as POST, updateHandler as PUT };
