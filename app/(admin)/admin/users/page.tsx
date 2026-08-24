'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatUZS } from '@/lib/serialize';
import { Pencil, Ban, CheckCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await fetch('/api/users')).json(),
  });
  const users = data?.users ?? [];

  const editMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setEditingId(null); },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Userlar</p>
        <p className="text-sm text-ink-soft">3 investor + 1 admin</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {users.map((u: any) => (
          <Card key={u.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coffee text-sm font-semibold text-cream">
                  {u.name[0]?.toUpperCase()}
                </div>
                <div>
                  {editingId === u.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg border border-border px-2 py-1 text-sm"
                    />
                  ) : (
                    <p className="font-medium text-ink">{u.name}</p>
                  )}
                  <p className="text-xs text-ink-soft">{u.email} • {u.role === 'ADMIN' ? 'Admin' : 'Investor'}</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${u.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {u.isActive ? 'Faol' : 'Bloklangan'}
              </span>
            </div>

            {u.role === 'INVESTOR' && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-soft">
                <p>Investitsiya: <span className="font-money text-ink">{formatUZS(u.investment?.initialAmount ?? 0)}</span></p>
                <p>Schot: <span className="font-money text-ink">{formatUZS(u.balance?.currentAmount ?? 0)}</span></p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              {editingId === u.id ? (
                <Button variant="primary" onClick={() => editMutation.mutate(u.id)} loading={editMutation.isPending}>Saqlash</Button>
              ) : (
                <Button variant="secondary" onClick={() => { setEditingId(u.id); setEditName(u.name); }}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              )}
              <Button
                variant={u.isActive ? 'danger' : 'secondary'}
                onClick={() => toggleActiveMutation.mutate({ id: u.id, isActive: !u.isActive })}
              >
                {u.isActive ? <><Ban className="h-3.5 w-3.5" /> Bloklash</> : <><CheckCircle className="h-3.5 w-3.5" /> Faollashtirish</>}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
