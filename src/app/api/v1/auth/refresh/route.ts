import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { refreshTokenSchema } from '@/lib/api/validation';

// Refresh token handler
async function refreshHandler(data: { refreshToken: string }) {
  try {
    const { refreshToken } = data;

    // Refresh with Supabase
    const { data: authData, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error('Invalid refresh token');
    }

    if (!authData.session) {
      throw new Error('Session refresh failed');
    }

    const response = {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt: new Date(authData.session.expires_at * 1000).toISOString(),
    };

    return apiSuccess(response, 'Token refreshed successfully');
  } catch (error) {
    console.error('Refresh error:', error);
    return apiError(error instanceof Error ? error : new Error('Refresh failed'), 401);
  }
}

// Create handler with middleware
const handler = createApiHandler(
  withValidation(refreshTokenSchema, 'body')(refreshHandler),
  {
    rateLimit: 10,
  }
);

export { handler as POST };



