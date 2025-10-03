import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CircularDetailContent } from './components/CircularDetailContent';
import { CircularDetailSkeleton } from './components/CircularDetailSkeleton';
import { notFound } from 'next/navigation';

interface CircularDetailPageProps {
  params: {
    id: string;
  };
}

export default function CircularDetailPage({ params }: CircularDetailPageProps) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header with back button */}
      <div className="mb-6">
        <Link href="/circulars">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Circulars
          </Button>
        </Link>
      </div>

      {/* Content */}
      <Suspense fallback={<CircularDetailSkeleton />}>
        <CircularDetailContent circularId={id} />
      </Suspense>
    </div>
  );
}



