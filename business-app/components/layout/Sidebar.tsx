'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import {
  LayoutDashboard, Users, Wallet, Banknote, CreditCard, History, Bell, Settings,
  Briefcase, ShieldCheck, FileBarChart,
} from 'lucide-react';

const investorNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/investors', label: 'Investorlar', icon: Users },
  { href: '/investments', label: 'Investitsiyalar', icon: Wallet },
  { href: '/loans', label: 'Qarz', icon: Banknote },
  { href: '/cards', label: 'Kartalar', icon: CreditCard },
  { href: '/history', label: 'Tarix', icon: History },
  { href: '/notifications', label: 'Bildirishnomalar', icon: Bell },
  { href: '/settings', label: 'Sozlamalar', icon: Settings },
];

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Userlar', icon: Users },
  { href: '/admin/business', label: 'Biznes', icon: Briefcase },
  { href: '/admin/investments', label: 'Investitsiyalar', icon: Wallet },
  { href: '/admin/loans', label: 'Qarzlar', icon: Banknote },
  { href: '/admin/history', label: 'Tarix', icon: History },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ShieldCheck },
  { href: '/admin/reports', label: 'Hisobotlar', icon: FileBarChart },
  { href: '/admin/notifications', label: 'Bildirishnomalar', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const items = isAdmin ? adminNav : investorNav;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-cream/60 px-4 py-6 md:flex">
      <div className="mb-8 px-2">
        <p className="font-display text-xl italic text-coffee-dark">Biznes Panel</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-coffee text-cream shadow-soft' : 'text-ink-soft hover:bg-border/40'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
