import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';

// Logout handler
async function logoutHandler(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');

    if (token) {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        // Continue anyway
      }
    }

    return apiSuccess({}, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return apiError(error instanceof Error ? error : new Error('Logout failed'), 500);
  }
}

// Create handler with middleware
const handler = createApiHandler(logoutHandler, {
  requireAuth: true,
  rateLimit: 10,
});

export { handler as POST };
