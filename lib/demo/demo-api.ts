'use client';

import { demoBasePath, isDemoMode } from './demo-mode';

const STORAGE_KEY = 'mentorMatchDemoState:v1';

type DemoUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  isAdmin?: boolean;
};

type DiscoveryProfile = {
  id: string;
  fullName: string;
  role: string;
  occupation: string;
  province: string;
  city?: string;
  specialties: string[];
  languages: string[];
  bioShort: string;
  photoUrl?: string;
};

type DemoRequest = {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  senderName: string;
  receiverName: string;
  senderEmail: string;
  receiverEmail: string;
  message: string;
  goals: string[];
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
};

type DemoMatch = {
  id: string;
  mentorId: string;
  menteeId: string;
  mentorName?: string;
  menteeName?: string;
  participants?: string[];
  startedAt?: string;
  status?: string;
  hiddenFor?: string[];
  unreadCount?: number;
  mentorPhoto?: string | null;
  menteePhoto?: string | null;
};

type DemoMessage = {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  type: 'text';
  createdAt: string;
  readBy: string[];
};

type DemoReport = {
  id: string;
  category: string;
  details: string;
  status: string;
};

type DemoState = {
  me: DemoUser;
  profile: Record<string, any> | null;
  profilesPublic: DiscoveryProfile[];
  bookmarks: string[];
  requests: DemoRequest[];
  matches: DemoMatch[];
  messages: DemoMessage[];
  reports: DemoReport[];
};

function nowIso() {
  return new Date().toISOString();
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function seedState(): DemoState {
  const me: DemoUser = {
    uid: 'demo-user-1',
    email: 'demo@mentormatch.local',
    displayName: 'Demo User',
    photoURL: null,
    isAdmin: true,
  };

  const profile: Record<string, any> = {
    fullName: 'Demo User',
    preferredName: 'Demo',
    email: me.email,
    phone: '+27 00 000 0000',
    role: 'Mentee',
    occupation: 'Physiotherapist',
    province: 'WC',
    city: 'Cape Town',
    languages: ['English', 'Xitsonga'],
    specialties: ['Musculoskeletal', 'Community Rehab'],
    bioShort: 'Community service physio exploring rural rehab pathways and clinical mentorship.',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=512&auto=format&fit=crop',
    notifications: {
      push: true,
      email: true,
    },
  };

  const profilesPublic: DiscoveryProfile[] = [
    {
      id: 'demo-mentor-1',
      fullName: 'Dr. Lindiwe Khumalo',
      role: 'Mentor',
      occupation: 'Occupational Therapist',
      province: 'GP',
      city: 'Johannesburg',
      specialties: ['Paediatrics', 'Neurology', 'Mental Health'],
      languages: ['English', 'Zulu'],
      bioShort: 'Paeds OT with a focus on neurodevelopmental support and caregiver coaching.',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'demo-mentor-2',
      fullName: 'Ayanda Mokoena',
      role: 'Mentor',
      occupation: 'Physiotherapist',
      province: 'EC',
      city: 'Mthatha',
      specialties: ['Cardio-respiratory', 'Community Rehab', 'Geriatrics'],
      languages: ['English', 'Xhosa'],
      bioShort: 'Rural rehab physio passionate about mentorship, systems thinking, and clinician wellbeing.',
      photoUrl: 'https://images.unsplash.com/photo-1524503033411-f9f3a9a6fbb8?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'demo-mentee-1',
      fullName: 'Sipho Dlamini',
      role: 'Mentee',
      occupation: 'Radiographer',
      province: 'KZN',
      city: 'Durban',
      specialties: ['Radiography'],
      languages: ['English', 'Zulu'],
      bioShort: 'Newly qualified radiographer looking for guidance on career pathways and leadership.',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'demo-mentor-3',
      fullName: 'Naledi Botha',
      role: 'Mentor',
      occupation: 'Pharmacist',
      province: 'FS',
      city: 'Bloemfontein',
      specialties: ['Hospital Pharmacy', 'Community Pharmacy'],
      languages: ['English', 'Afrikaans'],
      bioShort: 'Hospital pharmacist mentoring on medication safety and patient counselling.',
      photoUrl: 'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'demo-mentor-4',
      fullName: 'Thandi Ndlovu',
      role: 'Mentor',
      occupation: 'Physiotherapist',
      province: 'WC',
      city: 'Cape Town',
      specialties: ['Sports', 'Musculoskeletal', 'Rehabilitation'],
      languages: ['English'],
      bioShort: 'Sports physio with an interest in injury prevention and sustainable training.',
      photoUrl: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const requests: DemoRequest[] = [
    {
      id: 'demo-req-1',
      senderUserId: 'demo-mentee-1',
      receiverUserId: me.uid,
      senderName: 'Sipho Dlamini',
      receiverName: profile.fullName,
      senderEmail: 'sipho@example.com',
      receiverEmail: me.email,
      message: "Hi! I'm starting in a busy district hospital and would love guidance on staying organised and growing clinically.",
      goals: ['General support'],
      status: 'pending',
      createdAt: hoursAgo(6),
      updatedAt: hoursAgo(6),
    },
    {
      id: 'demo-req-2',
      senderUserId: me.uid,
      receiverUserId: 'demo-mentor-2',
      senderName: profile.fullName,
      receiverName: 'Ayanda Mokoena',
      senderEmail: me.email,
      receiverEmail: 'ayanda@example.com',
      message: 'Hi Ayanda — I’m working in community service and would appreciate mentorship on rural rehab workflows and sustainable caseload planning.',
      goals: ['General support'],
      status: 'pending',
      createdAt: hoursAgo(30),
      updatedAt: hoursAgo(30),
    },
  ];

  const matches: DemoMatch[] = [
    {
      id: 'demo-match-1',
      mentorId: 'demo-mentor-4',
      menteeId: me.uid,
      mentorName: 'Thandi Ndlovu',
      menteeName: profile.fullName,
      mentorPhoto: profilesPublic.find((p) => p.id === 'demo-mentor-4')?.photoUrl ?? null,
      menteePhoto: profile.photoUrl ?? null,
      participants: ['demo-mentor-4', me.uid],
      startedAt: hoursAgo(72),
      status: 'active',
      hiddenFor: [],
    },
  ];

  const messages: DemoMessage[] = [
    {
      id: 'demo-msg-1',
      matchId: 'demo-match-1',
      senderId: 'demo-mentor-4',
      body: 'Welcome! What would you like to focus on in your first month?\n\nWe can start with goal-setting + a simple weekly check-in cadence.',
      type: 'text',
      createdAt: hoursAgo(60),
      readBy: ['demo-mentor-4'],
    },
    {
      id: 'demo-msg-2',
      matchId: 'demo-match-1',
      senderId: me.uid,
      body: 'Thanks! I’d love help with safe return-to-play basics and managing time between admin + patients.',
      type: 'text',
      createdAt: hoursAgo(58),
      readBy: [me.uid],
    },
    {
      id: 'demo-msg-3',
      matchId: 'demo-match-1',
      senderId: 'demo-mentor-4',
      body: 'Great. Let’s outline a 4-week plan, then I’ll share a simple screening checklist you can reuse.',
      type: 'text',
      createdAt: hoursAgo(56),
      readBy: ['demo-mentor-4'],
    },
  ];

  const reports: DemoReport[] = [
    {
      id: 'demo-report-1',
      category: 'Harassment',
      details: 'User reported repeated unwanted messages in chat.',
      status: 'open',
    },
    {
      id: 'demo-report-2',
      category: 'Impersonation',
      details: 'Profile photo appears to be stock imagery; please review verification status.',
      status: 'open',
    },
  ];

  return {
    me,
    profile,
    profilesPublic,
    bookmarks: [],
    requests,
    matches,
    messages,
    reports,
  };
}

function readState(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as DemoState;
  } catch {
    const seeded = seedState();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    } catch {}
    return seeded;
  }
}

function writeState(next: DemoState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function okResponse() {
  return new Response(null, { status: 204 });
}

async function readJsonBody(input: RequestInfo | URL, init?: RequestInit): Promise<any> {
  // Prefer init.body when present.
  const body = init?.body;
  if (!body && input instanceof Request) {
    try {
      // Clone to avoid consuming body.
      return await input.clone().json();
    } catch {
      return null;
    }
  }

  if (!body) return null;

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }

  // FormData upload (avatar) — we don't need to parse it.
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return null;
  }

  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    const obj: Record<string, string> = {};
    body.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  return null;
}

function getPathForRouting(rawPathname: string): string {
  if (demoBasePath && rawPathname.startsWith(demoBasePath + '/')) {
    return rawPathname.slice(demoBasePath.length);
  }
  return rawPathname;
}

function getProfileById(state: DemoState, id: string): DiscoveryProfile | null {
  return state.profilesPublic.find((p) => p.id === id) ?? null;
}

function enrichRequest(state: DemoState, userId: string, r: DemoRequest) {
  const senderProfile = r.senderUserId === userId ? null : getProfileById(state, r.senderUserId);
  const receiverProfile = r.receiverUserId === userId ? null : getProfileById(state, r.receiverUserId);

  const createdAtMs = r.createdAt ? Date.parse(r.createdAt) : 0;
  const isRecent = createdAtMs > 0 ? Date.now() - createdAtMs < 1000 * 60 * 60 * 48 : false;

  return {
    ...r,
    senderPhoto:
      r.senderUserId === state.me.uid
        ? (state.profile?.photoUrl ?? null)
        : (senderProfile?.photoUrl ?? null),
    receiverPhoto:
      r.receiverUserId === state.me.uid
        ? (state.profile?.photoUrl ?? null)
        : (receiverProfile?.photoUrl ?? null),
    senderName:
      r.senderUserId === state.me.uid
        ? (state.profile?.fullName ?? state.me.displayName)
        : (senderProfile?.fullName ?? r.senderName ?? 'User'),
    receiverName:
      r.receiverUserId === state.me.uid
        ? (state.profile?.fullName ?? state.me.displayName)
        : (receiverProfile?.fullName ?? r.receiverName ?? 'User'),
    isNew: r.status === 'pending' && r.receiverUserId === userId && isRecent,
  };
}

function computeUnreadCount(state: DemoState, matchId: string, userId: string) {
  return state.messages.filter((m) => {
    if (m.matchId !== matchId) return false;
    if (m.senderId === userId) return false;
    return !Array.isArray(m.readBy) || !m.readBy.includes(userId);
  }).length;
}

async function handleDemoApiRequest(
  url: URL,
  method: string,
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response | null> {
  const pathname = getPathForRouting(url.pathname);

  if (!pathname.startsWith('/api/')) {
    return null;
  }

  const state = readState();
  const userId = state.me.uid;

  // --- Auth ---
  if (pathname === '/api/auth/check-email' && method === 'POST') {
    return jsonResponse({ exists: true, hasProfile: true });
  }

  if (pathname === '/api/auth/post-login' && method === 'POST') {
    return jsonResponse({ status: 'ok' });
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    return jsonResponse({ status: 'ok' });
  }

  // --- Profile ---
  if (pathname === '/api/profile' && method === 'GET') {
    const profile = state.profile;
    const hasProfile = Boolean(profile && (profile as any).fullName && (profile as any).occupation && (profile as any).bioShort);
    return jsonResponse({ profile, hasProfile });
  }

  if (pathname === '/api/profile' && (method === 'POST' || method === 'PATCH')) {
    const payload = (await readJsonBody(input, init)) ?? {};
    const nextProfile = { ...(state.profile ?? {}), ...payload };
    const nextState: DemoState = {
      ...state,
      profile: nextProfile,
      me: {
        ...state.me,
        displayName: nextProfile?.preferredName || nextProfile?.fullName || state.me.displayName,
      },
    };
    writeState(nextState);
    return jsonResponse({ status: 'ok' });
  }

  // --- Discovery ---
  if (pathname === '/api/discovery' && method === 'GET') {
    const filters = url.searchParams;
    let profiles = state.profilesPublic.slice();

    const role = filters.get('role');
    const occupation = filters.get('occupation');
    const province = filters.get('province');
    const languages = filters.getAll('languages');

    if (role) profiles = profiles.filter((p) => p.role === role);
    if (occupation) profiles = profiles.filter((p) => p.occupation === occupation);
    if (province) profiles = profiles.filter((p) => p.province === province);
    if (languages.length) {
      const langSet = new Set(languages);
      profiles = profiles.filter((p) => p.languages.some((l) => langSet.has(l)));
    }

    return jsonResponse({ profiles });
  }

  // --- Bookmarks ---
  if (pathname === '/api/bookmarks' && method === 'POST') {
    const payload = (await readJsonBody(input, init)) ?? {};
    const targetUserId = payload?.targetUserId as string | undefined;
    if (!targetUserId) return jsonResponse({ error: 'targetUserId required' }, 400);

    const next = new Set(state.bookmarks);
    next.add(targetUserId);
    writeState({ ...state, bookmarks: Array.from(next) });
    return jsonResponse({ status: 'ok' });
  }

  // --- Requests ---
  if (pathname === '/api/requests' && method === 'POST') {
    const payload = (await readJsonBody(input, init)) ?? {};
    const receiverUserId = payload?.receiverUserId as string | undefined;
    const message = (payload?.message as string | undefined) ?? '';
    const goals = Array.isArray(payload?.goals) ? (payload.goals as string[]) : ['General support'];

    if (!receiverUserId) return jsonResponse({ error: 'receiverUserId required' }, 400);

    const receiverProfile = getProfileById(state, receiverUserId);

    const req: DemoRequest = {
      id: `demo-req-${Date.now()}`,
      senderUserId: userId,
      receiverUserId,
      senderName: state.profile?.fullName ?? state.me.displayName,
      receiverName: receiverProfile?.fullName ?? 'User',
      senderEmail: state.me.email,
      receiverEmail: `${receiverUserId}@example.com`,
      message,
      goals,
      status: 'pending',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    writeState({ ...state, requests: [req, ...state.requests] });
    return jsonResponse({ id: req.id });
  }

  if (pathname === '/api/requests' && method === 'GET') {
    const sent = state.requests.filter((r) => r.senderUserId === userId).map((r) => enrichRequest(state, userId, r));
    const received = state.requests.filter((r) => r.receiverUserId === userId).map((r) => enrichRequest(state, userId, r));
    return jsonResponse({ sent, received });
  }

  const requestIdMatch = pathname.match(/^\/api\/requests\/([^/]+)$/);
  if (requestIdMatch && method === 'PATCH') {
    const id = requestIdMatch[1];
    const payload = (await readJsonBody(input, init)) ?? {};
    const status = payload?.status as DemoRequest['status'];

    const allowed = new Set(['accepted', 'declined', 'withdrawn']);
    if (!allowed.has(status)) return jsonResponse({ error: 'Invalid status' }, 400);

    const existing = state.requests.find((r) => r.id === id);
    if (!existing) return jsonResponse({ error: 'Not found' }, 404);

    const updated: DemoRequest = {
      ...existing,
      status,
      updatedAt: nowIso(),
    };

    let matchId: string | undefined = undefined;
    let nextMatches = state.matches.slice();

    if (status === 'accepted') {
      matchId = `demo-match-${Date.now()}`;
      const mentorId = updated.receiverUserId;
      const menteeId = updated.senderUserId;

      const mentorProfile = mentorId === userId ? null : getProfileById(state, mentorId);
      const menteeProfile = menteeId === userId ? null : getProfileById(state, menteeId);

      nextMatches = [
        {
          id: matchId,
          mentorId,
          menteeId,
          mentorName: mentorProfile?.fullName ?? (mentorId === userId ? (state.profile?.fullName ?? state.me.displayName) : 'Mentor'),
          menteeName: menteeProfile?.fullName ?? (menteeId === userId ? (state.profile?.fullName ?? state.me.displayName) : 'Mentee'),
          mentorPhoto: mentorProfile?.photoUrl ?? (mentorId === userId ? (state.profile?.photoUrl ?? null) : null),
          menteePhoto: menteeProfile?.photoUrl ?? (menteeId === userId ? (state.profile?.photoUrl ?? null) : null),
          participants: [mentorId, menteeId],
          startedAt: nowIso(),
          status: 'active',
          hiddenFor: [],
        },
        ...nextMatches,
      ];
    }

    writeState({
      ...state,
      requests: state.requests.map((r) => (r.id === id ? updated : r)),
      matches: nextMatches,
    });

    return jsonResponse({ status: 'ok', matchId });
  }

  // --- Matches ---
  if (pathname === '/api/matches' && method === 'GET') {
    const matches = state.matches
      .filter((m) => (m.participants ?? [m.mentorId, m.menteeId]).includes(userId))
      .map((m) => ({
        ...m,
        unreadCount: computeUnreadCount(state, m.id, userId),
      }));

    return jsonResponse({ matches });
  }

  const matchIdMatch = pathname.match(/^\/api\/matches\/([^/]+)$/);
  if (matchIdMatch && method === 'PATCH') {
    const id = matchIdMatch[1];
    const payload = (await readJsonBody(input, init)) ?? {};
    const action = payload?.action as string | undefined;

    const match = state.matches.find((m) => m.id === id);
    if (!match) return jsonResponse({ error: 'Match not found' }, 404);

    const participants = match.participants ?? [match.mentorId, match.menteeId];
    if (!participants.includes(userId)) return jsonResponse({ error: 'Forbidden' }, 403);

    const hiddenFor = Array.isArray(match.hiddenFor) ? match.hiddenFor.slice() : [];
    if (action === 'hide') {
      if (!hiddenFor.includes(userId)) hiddenFor.push(userId);
      writeState({
        ...state,
        matches: state.matches.map((m) => (m.id === id ? { ...m, hiddenFor } : m)),
      });
      return jsonResponse({ status: 'hidden' });
    }

    if (action === 'unhide') {
      const next = hiddenFor.filter((uid) => uid !== userId);
      writeState({
        ...state,
        matches: state.matches.map((m) => (m.id === id ? { ...m, hiddenFor: next } : m)),
      });
      return jsonResponse({ status: 'unhidden' });
    }

    return jsonResponse({ error: 'Invalid action' }, 400);
  }

  if (matchIdMatch && method === 'DELETE') {
    const id = matchIdMatch[1];
    writeState({
      ...state,
      matches: state.matches.filter((m) => m.id !== id),
      messages: state.messages.filter((m) => m.matchId !== id),
    });
    return jsonResponse({ status: 'deleted' });
  }

  const messagesMatch = pathname.match(/^\/api\/matches\/([^/]+)\/messages$/);
  if (messagesMatch && method === 'GET') {
    const matchId = messagesMatch[1];
    const match = state.matches.find((m) => m.id === matchId);
    if (!match) return jsonResponse({ error: 'Match not found' }, 404);

    const participants = match.participants ?? [match.mentorId, match.menteeId];
    if (!participants.includes(userId)) return jsonResponse({ error: 'Forbidden' }, 403);

    const peerId = match.mentorId === userId ? match.menteeId : match.mentorId;
    const peerProfile = peerId === userId ? null : getProfileById(state, peerId);

    const peer = {
      id: peerId,
      name:
        peerId === userId
          ? (state.profile?.fullName ?? state.me.displayName)
          : (peerProfile?.fullName ?? 'User'),
      photoUrl:
        peerId === userId
          ? (state.profile?.photoUrl ?? null)
          : (peerProfile?.photoUrl ?? null),
    };

    const me = {
      id: userId,
      name: state.profile?.fullName ?? state.me.displayName,
      photoUrl: state.profile?.photoUrl ?? null,
    };

    const messages = state.messages
      .filter((m) => m.matchId === matchId)
      .slice()
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

    return jsonResponse({ peer, me, messages });
  }

  if (messagesMatch && method === 'POST') {
    const matchId = messagesMatch[1];
    const payload = (await readJsonBody(input, init)) ?? {};
    const body = (payload?.body as string | undefined) ?? '';

    const msg: DemoMessage = {
      id: `demo-msg-${Date.now()}`,
      matchId,
      senderId: userId,
      body,
      type: 'text',
      createdAt: nowIso(),
      readBy: [userId],
    };

    writeState({ ...state, messages: [...state.messages, msg] });
    return jsonResponse({ id: msg.id });
  }

  const readMatch = pathname.match(/^\/api\/matches\/([^/]+)\/messages\/read$/);
  if (readMatch && method === 'POST') {
    const matchId = readMatch[1];
    const nextMessages = state.messages.map((m) => {
      if (m.matchId !== matchId) return m;
      const readBy = Array.isArray(m.readBy) ? m.readBy.slice() : [];
      if (!readBy.includes(userId)) readBy.push(userId);
      return { ...m, readBy };
    });
    writeState({ ...state, messages: nextMessages });
    return okResponse();
  }

  // --- Admin ---
  if (pathname === '/api/admin/reports' && method === 'GET') {
    if (!state.me.isAdmin) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    return jsonResponse({ reports: state.reports });
  }

  const reportIdMatch = pathname.match(/^\/api\/admin\/reports\/([^/]+)$/);
  if (reportIdMatch && method === 'PATCH') {
    if (!state.me.isAdmin) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    const id = reportIdMatch[1];
    const payload = (await readJsonBody(input, init)) ?? {};
    const nextReports = state.reports.map((r) => (r.id === id ? { ...r, ...payload } : r));
    writeState({ ...state, reports: nextReports });
    return jsonResponse({ status: 'ok' });
  }

  // --- Upload ---
  if (pathname === '/api/upload/image' && method === 'POST') {
    // We don't actually store the image anywhere in demo mode.
    return jsonResponse({
      url: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=512&auto=format&fit=crop',
    });
  }

  // Unknown demo endpoint
  return jsonResponse({ error: `Demo API: Not implemented (${method} ${pathname})` }, 404);
}

export function installDemoApiFetch() {
  if (!isDemoMode) return;
  if (typeof window === 'undefined') return;

  const w = window as any;
  if (w.__mentorMatchDemoApiInstalled) return;
  w.__mentorMatchDemoApiInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : input.toString();

      const url = new URL(urlStr, window.location.origin);
      const method = (
        (init?.method || (input instanceof Request ? input.method : 'GET'))
      ).toUpperCase();

      const maybe = await handleDemoApiRequest(url, method, input, init);
      if (maybe) return maybe;

      return originalFetch(input as any, init);
    } catch (err) {
      // Fall back to the real fetch if our demo handler breaks.
      return originalFetch(input as any, init);
    }
  };
}
