import { Suspense } from 'react';
import { CircularsContent } from './components/CircularsContent';
import { CircularsSkeleton } from './components/CircularsSkeleton';

export default function CircularsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Circulars & Announcements</h1>
        <p className="text-muted-foreground mt-2">
          Company communications requiring attention and acknowledgment
        </p>
      </div>

      <Suspense fallback={<CircularsSkeleton />}>
        <CircularsContent />
      </Suspense>
    </div>
  );
}
