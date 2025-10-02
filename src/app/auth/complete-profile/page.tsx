import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth/session';
import { AuthLayout, AuthAlert } from '@/components/auth/AuthLayout';

export default async function CompleteProfilePage() {
  const userWithProfile = await getCurrentUserWithProfile();

  if (!userWithProfile?.user) {
    redirect('/auth/login');
  }

  if (userWithProfile.profile) {
    redirect('/dashboard');
  }

  return (
    <AuthLayout
      title="Profile Setup Required"
      subtitle="Complete your profile to continue"
    >
      <AuthAlert variant="warning">
        <div className="text-sm">
          <p className="font-medium">Profile Setup Required</p>
          <p className="mt-2">
            Your account has been created, but we need some additional information to complete your profile.
          </p>
          <p className="mt-2">
            Please contact your administrator to complete the profile setup process.
          </p>
        </div>
      </AuthAlert>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Email: {userWithProfile.user.email}
        </p>
      </div>
    </AuthLayout>
  );
}
