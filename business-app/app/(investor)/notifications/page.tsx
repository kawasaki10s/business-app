'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Bell } from 'lucide-react';
import clsx from 'clsx';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await fetch('/api/notifications')).json(),
  });
  const notifications = data?.notifications ?? [];

  const markRead = useMutation({
    mutationFn: async (id: string) => fetch(`/api/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <p className="font-display text-2xl italic text-coffee-dark">Bildirishnomalar</p>

      <div className="space-y-2">
        {notifications.map((n: any) => (
          <Card
            key={n.id}
            onClick={() => !n.isRead && markRead.mutate(n.id)}
            className={clsx('flex cursor-pointer items-start gap-3', !n.isRead && 'border-bronze/50 bg-cream/60')}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coffee text-cream">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-ink">{n.message}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{new Date(n.createdAt).toLocaleString('uz-UZ')}</p>
            </div>
            {!n.isRead && <span className="ml-auto mt-1.5 h-2 w-2 shrink-0 rounded-full bg-bronze" />}
          </Card>
        ))}
        {notifications.length === 0 && <p className="text-sm text-ink-soft">Bildirishnoma yo'q</p>}
      </div>
    </div>
  );
}
