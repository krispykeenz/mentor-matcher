'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Home, Users, MessageSquare, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  return [
    '/signin',
    '/complete',
    '/onboarding',
    '/admin',
    '/legal',
  ].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function TopNav() {
  const pathname = usePathname() || '/';
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [unreadTotal, setUnreadTotal] = useState<number>(0);

  const hidden = useMemo(() => shouldHide(pathname), [pathname]);
  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      if (!user) {
        setPendingRequests(0);
        setMatchCount(0);
        return;
      }
      try {
        const [reqRes, matchRes] = await Promise.all([
          fetch('/api/requests'),
          fetch('/api/matches'),
        ]);
        if (!cancelled) {
          if (reqRes.ok) {
            const data = (await reqRes.json()) as {
              sent: any[];
              received: { status?: string }[];
            };
            const pending = (data.received || []).filter(
              (r) => (r.status || '').toLowerCase() === 'pending',
            ).length;
            setPendingRequests(pending);
          } else {
            setPendingRequests(0);
          }
          if (matchRes.ok) {
            const data = (await matchRes.json()) as { matches?: { unreadCount?: number }[] };
            const matches = data.matches || [];
            setMatchCount(matches.length);
            const unread = matches.reduce((sum, m) => sum + (m.unreadCount || 0), 0);
            setUnreadTotal(unread);
          } else {
            setMatchCount(0);
          }
        }
      } catch {
        if (!cancelled) {
          setPendingRequests(0);
          setMatchCount(0);
        }
      }
    }
    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, [user, pathname]);

  if (hidden) return null;

  return (
    <header className="hidden md:block fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-gradient-to-b from-white/90 to-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/discover" className="font-semibold text-slate-900">
          <span className="bg-gradient-to-r from-brand-700 to-sand-700 bg-clip-text text-transparent">MentorMatch SA</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-2">
            {items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              const count = href === '/requests' ? pendingRequests : href === '/matches' ? matchCount : 0;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                      active ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span>{label}</span>
                    {href === '/requests' && count > 0 && (
                      <Badge className="ml-1" variant="default">
                        {count}
                      </Badge>
                    )}
                    {href === '/matches' && unreadTotal > 0 && (
                      <Badge className="ml-1" variant="default">
                        {unreadTotal}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="hidden text-xs text-slate-500 md:inline">{user.email}</span>
          )}
          <Link href="/profile" aria-label="Profile">
            <Avatar
              src={user?.photoURL || undefined}
              alt={user?.email || 'Profile'}
              className="h-8 w-8 ring-2 ring-white shadow-soft"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}