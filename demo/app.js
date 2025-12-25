// DEMO MODE ONLY: Static showcase with mocked profiles.
// Remove the /demo folder when publishing a real deployment.

const PROFILES = [
  {
    id: 'm1',
    name: 'Dr. Naledi M.',
    role: 'Family Medicine Mentor',
    province: 'Western Cape',
    languages: ['English', 'Xitsonga'],
    bio: 'Focus: community service guidance, case review, and career planning.',
  },
  {
    id: 'm2',
    name: 'Thabo K.',
    role: 'Clinical Psych Mentor',
    province: 'Gauteng',
    languages: ['English', 'isiZulu'],
    bio: 'Focus: reflective practice, patient communication, and burnout prevention.',
  },
  {
    id: 'm3',
    name: 'Sibongile P.',
    role: 'Pharmacy Mentor',
    province: 'KwaZulu-Natal',
    languages: ['English', 'isiXhosa'],
    bio: 'Focus: operational workflows, medicine safety, and exam prep.',
  },
  {
    id: 'm4',
    name: 'Aisha R.',
    role: 'Nursing Mentor',
    province: 'Eastern Cape',
    languages: ['English', 'Afrikaans'],
    bio: 'Focus: triage, documentation habits, and ward leadership skills.',
  },
];

const state = {
  idx: 0,
  requested: [],
};

const els = {
  deckCount: document.getElementById('deckCount'),
  requestedCount: document.getElementById('requestedCount'),
  cardArea: document.getElementById('cardArea'),
  requestedList: document.getElementById('requestedList'),
  passBtn: document.getElementById('passBtn'),
  requestBtn: document.getElementById('requestBtn'),
};

function currentProfile() {
  return PROFILES[state.idx] ?? null;
}

function pill(text) {
  return `<span class="pill">${text}</span>`;
}

function renderCard() {
  const p = currentProfile();
  els.cardArea.innerHTML = '';

  const remaining = Math.max(0, PROFILES.length - state.idx);
  els.deckCount.textContent = `${remaining} left`;

  if (!p) {
    const done = document.createElement('div');
    done.className = 'muted';
    done.innerHTML =
      '<strong>End of demo deck.</strong><br/>Refresh the page to restart the swipe flow.';
    els.cardArea.appendChild(done);
    els.passBtn.disabled = true;
    els.requestBtn.disabled = true;
    return;
  }

  els.passBtn.disabled = false;
  els.requestBtn.disabled = false;

  const card = document.createElement('div');
  card.className = 'product';

  card.innerHTML = `
    <h3 style="margin:0 0 .35rem;">${p.name}</h3>
    <div class="meta">${p.role} • ${p.province}</div>
    <div class="meta" style="margin-top:.4rem;">Languages: ${p.languages.join(', ')}</div>
    <p class="muted" style="margin:.7rem 0 0;">${p.bio}</p>
  `;

  els.cardArea.appendChild(card);
}

function renderRequested() {
  els.requestedCount.textContent = `${state.requested.length} requested`;
  els.requestedList.innerHTML = '';

  if (!state.requested.length) {
    const empty = document.createElement('div');
    empty.className = 'muted';
    empty.textContent = 'No requests yet. Tap “Request mentorship” on a profile.';
    els.requestedList.appendChild(empty);
    return;
  }

  for (const p of state.requested) {
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <div>
        <div class="name">${p.name}</div>
        <div class="line">${p.role} • ${p.province}</div>
      </div>
      <div>${pill('Requested')}</div>
    `;
    els.requestedList.appendChild(item);
  }
}

function next() {
  state.idx += 1;
  renderCard();
}

function request() {
  const p = currentProfile();
  if (!p) return;
  if (!state.requested.some((x) => x.id === p.id)) state.requested.push(p);
  renderRequested();
  next();
}

els.passBtn.addEventListener('click', next);
els.requestBtn.addEventListener('click', request);

renderCard();
renderRequested();
