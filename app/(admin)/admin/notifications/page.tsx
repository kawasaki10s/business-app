'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell } from 'lucide-react';

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await fetch('/api/notifications')).json(),
  });
  const notifications = data?.notifications ?? [];

  const mutation = useMutation({
    mutationFn: async () =>
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setMessage('');
    },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <p className="font-display text-2xl italic text-coffee-dark">Bildirishnomalar</p>

      <Card>
        <p className="mb-3 text-sm font-medium text-ink">Hammaga xabar yuborish</p>
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Xabar matni..."
            className="flex-1 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coffee"
          />
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!message}>
            Yuborish
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {notifications.map((n: any) => (
          <Card key={n.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coffee text-cream">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-ink">{n.message}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{new Date(n.createdAt).toLocaleString('uz-UZ')}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
