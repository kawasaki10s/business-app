'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Coffee } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Email yoki parol noto\'g\'ri');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-coffee shadow-soft">
            <Coffee className="h-6 w-6 text-cream" />
          </div>
          <h1 className="font-display text-2xl italic text-coffee-dark">Biznes Boshqaruv Platformasi</h1>
          <p className="mt-1 text-sm text-ink-soft">Hisobingizga kiring</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white/70 p-6 shadow-card">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coffee"
              placeholder="siz@example.com"
            />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-ink">Parol</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coffee"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Kirish
          </Button>
        </form>
      </div>
    </div>
  );
}
