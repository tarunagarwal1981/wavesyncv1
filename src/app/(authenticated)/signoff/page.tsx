import { Suspense } from 'react';
import { SignoffContent } from './components/SignoffContent';
import { SignoffSkeleton } from './components/SignoffSkeleton';

export default function SignoffPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sign-off Management</h1>
        <p className="text-muted-foreground mt-2">
          Complete your vessel departure checklist and manage your sign-off process
        </p>
      </div>

      <Suspense fallback={<SignoffSkeleton />}>
        <SignoffContent />
      </Suspense>
    </div>
  );
}



