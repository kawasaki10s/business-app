'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) return { notifications: [] };
      return res.json();
    },
    refetchInterval: 30_000,
  });
  const unreadCount = (data?.notifications ?? []).filter((n: any) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-8">
      <p className="font-display text-lg italic text-coffee-dark md:hidden">Biznes Panel</p>
      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        <Link href="/notifications" className="relative rounded-full p-2 hover:bg-cream">
          <Bell className="h-5 w-5 text-ink-soft" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-border bg-white px-2 py-1.5 hover:bg-cream"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-coffee text-xs font-semibold text-cream">
              {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="hidden text-sm font-medium text-ink sm:inline">{session?.user?.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-soft" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white p-1.5 shadow-card animate-slideUp">
              <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-cream">
                <Settings className="h-4 w-4" /> Sozlamalar
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-cream"
              >
                <LogOut className="h-4 w-4" /> Chiqish
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
