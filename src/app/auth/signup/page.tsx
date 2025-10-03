import { redirectIfAuthenticated } from '@/lib/auth/session';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  // Redirect if already authenticated
  await redirectIfAuthenticated();

  const params = await searchParams;

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle={params.message || "Join WaveSync to manage your maritime career"}
    >
      <SignUpForm />
      
      {params.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {params.error}
        </div>
      )}
    </AuthLayout>
  );
}


