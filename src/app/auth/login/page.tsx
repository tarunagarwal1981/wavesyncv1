import { redirectIfAuthenticated } from '@/lib/auth/session';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  // Redirect if already authenticated
  await redirectIfAuthenticated();

  const params = await searchParams;

  return (
    <AuthLayout
      title="Sign in to WaveSync"
      subtitle={params.message || "Enter your credentials to access your account"}
    >
      <LoginForm />
      
      {params.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {params.error}
        </div>
      )}
    </AuthLayout>
  );
}


