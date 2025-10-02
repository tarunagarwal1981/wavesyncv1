import { Suspense } from 'react';
import { DocumentsContent } from './components/DocumentsContent';
import { DocumentsSkeleton } from './components/DocumentsSkeleton';

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Document Repository</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal and professional documents securely
        </p>
      </div>

      <Suspense fallback={<DocumentsSkeleton />}>
        <DocumentsContent />
      </Suspense>
    </div>
  );
}
