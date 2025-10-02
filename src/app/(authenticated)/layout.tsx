import { getCurrentUserWithProfile } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { LayoutProvider } from '@/components/navigation/LayoutProvider';
import { NavigationLayout } from '@/components/navigation/NavigationLayout';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userWithProfile = await getCurrentUserWithProfile();

  if (!userWithProfile?.user) {
    redirect('/auth/login');
  }

  if (!userWithProfile.profile) {
    redirect('/auth/complete-profile');
  }

  const { user, profile } = userWithProfile;

  return (
    <LayoutProvider user={user} profile={profile}>
      <NavigationLayout>
        {children}
      </NavigationLayout>
    </LayoutProvider>
  );
}