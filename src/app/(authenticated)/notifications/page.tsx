import { Suspense } from 'react';
import { NotificationsContent } from './components/NotificationsContent';
import { NotificationsSkeleton } from './components/NotificationsSkeleton';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with alerts, reminders, and important announcements
        </p>
      </div>

      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsContent />
      </Suspense>
    </div>
  );
}



