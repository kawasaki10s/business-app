'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name ?? '');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${(session?.user as any)?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ...(password ? { password } : {}) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => { setSuccess(true); setPassword(''); },
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <p className="font-display text-2xl italic text-coffee-dark">Sozlamalar</p>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Ism</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coffee"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Yangi parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="O'zgartirmaslik uchun bo'sh qoldiring"
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coffee"
            />
          </div>
          {success && <p className="text-sm text-success">Saqlandi</p>}
          <Button loading={mutation.isPending} onClick={() => { setSuccess(false); mutation.mutate(); }}>
            Saqlash
          </Button>
        </div>
      </Card>
    </div>
  );
}
