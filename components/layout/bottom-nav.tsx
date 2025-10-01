'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Home, Users, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Avatar } from '@/components/ui/avatar';

const items = [
  { href: '/discover', label: 'Discover', icon: Home },
  { href: '/matches', label: 'Matches', icon: Users },
  { href: '/requests', label: 'Requests', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function shouldHide(pathname: string) {
  // Hide on auth, onboarding, admin, and legal pages
  return [
    '/signin',
    '/complete',
    '/onboarding',
    '/admin',
    '/legal',
  ].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function BottomNav() {
  const pathname = usePathname() || '/';
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [unreadTotal, setUnreadTotal] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      try {
        const [reqRes, matchRes] = await Promise.all([
          fetch('/api/requests'),
          fetch('/api/matches'),
        ]);
        if (!cancelled) {
          if (reqRes.ok) {
            const data = (await reqRes.json()) as { received?: { status?: string }[] };
            const pending = (data.received || []).filter((r) => (r.status || '').toLowerCase() === 'pending').length;
            setPendingRequests(pending);
          } else {
            setPendingRequests(0);
          }
          if (matchRes.ok) {
            const data = (await matchRes.json()) as { matches?: { unreadCount?: number }[] };
            const matches = data.matches || [];
            const unread = matches.reduce((sum, m) => sum + (m.unreadCount || 0), 0);
            setUnreadTotal(unread);
          } else {
            setUnreadTotal(0);
          }
        }
      } catch {
        if (!cancelled) {
          setPendingRequests(0);
          setUnreadTotal(0);
        }
      }
    }
    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (shouldHide(pathname)) return null;

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-gradient-to-t from-white/95 to-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/70"
      role="navigation"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4 gap-1 px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                className={cn(
                  'relative flex w-full flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs',
                  active
                    ? 'text-brand-700 font-medium bg-brand-50'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative">
                  {href === '/profile' && (user?.photoURL || user?.displayName) ? (
                    <Avatar
                      src={user?.photoURL || undefined}
                      alt={user?.displayName || user?.email || 'Profile'}
                      className={cn('h-6 w-6 ring-2 ring-white shadow-soft', active ? 'ring-brand-200' : '')}
                    />
                  ) : (
                    <Icon
                      className={cn('h-5 w-5', active ? 'text-brand-700' : 'text-slate-600')}
                      aria-hidden
                    />
                  )}
                  {href === '/requests' && pendingRequests > 0 && (
                    <span className="absolute -right-2 -top-1 rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white">
                      {pendingRequests}
                    </span>
                  )}
                  {href === '/matches' && unreadTotal > 0 && (
                    <span className="absolute -right-2 -top-1 rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white">
                      {unreadTotal}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[calc(env(safe-area-inset-bottom))]" />
    </nav>
  );
}