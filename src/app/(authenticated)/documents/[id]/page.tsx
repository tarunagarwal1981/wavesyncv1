import { Suspense } from 'react';
import { DocumentDetailContent } from './components/DocumentDetailContent';
import { DocumentDetailSkeleton } from './components/DocumentDetailSkeleton';

interface DocumentDetailPageProps {
  params: {
    id: string;
  };
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Suspense fallback={<DocumentDetailSkeleton />}>
        <DocumentDetailContent documentId={params.id} />
      </Suspense>
    </div>
  );
}
