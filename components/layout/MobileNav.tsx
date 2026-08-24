'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import { LayoutDashboard, Users, Banknote, History, Settings } from 'lucide-react';

const investorItems = [
  { href: '/dashboard', label: 'Bosh', icon: LayoutDashboard },
  { href: '/investors', label: 'Investorlar', icon: Users },
  { href: '/loans', label: 'Qarz', icon: Banknote },
  { href: '/history', label: 'Tarix', icon: History },
  { href: '/settings', label: 'Sozlama', icon: Settings },
];

const adminItems = [
  { href: '/admin/dashboard', label: 'Bosh', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Userlar', icon: Users },
  { href: '/admin/loans', label: 'Qarzlar', icon: Banknote },
  { href: '/admin/history', label: 'Tarix', icon: History },
  { href: '/admin/settings', label: 'Sozlama', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const items = isAdmin ? adminItems : investorItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
              active ? 'text-coffee' : 'text-ink-soft'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
