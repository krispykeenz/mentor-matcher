import { getAdminServices } from '@/lib/firebase/server';
import { discoveryFiltersSchema, baseProfileSchema, type BaseProfileFormValues } from '@/lib/utils/schemas';
import { scoreCandidate } from '@/lib/utils/matching';

export async function fetchDiscoveryProfiles(query: Record<string, unknown>, viewerId?: string) {
  const filters = discoveryFiltersSchema.partial().parse(query);
  const { db } = getAdminServices();
  // Composite indexes required:
  // profiles_public: discoverable ASC, province ASC, occupation ASC
  // profiles_public: discoverable ASC, languages ARRAY
  let ref = db.collection('profiles_public').where('discoverable', '==', true).limit(50);

  if (filters.roleWanted) {
    ref = ref.where('role', '==', filters.roleWanted);
  }
  if (filters.occupation) {
    ref = ref.where('occupation', '==', filters.occupation);
  }
  if (filters.province) {
    ref = ref.where('province', '==', filters.province);
  }

  const snapshot = await ref.get();
  const profiles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));
  const filtered = filters.languages?.length
    ? profiles.filter((profile) => profile.languages?.some((language: string) => filters.languages!.includes(language)))
    : profiles;

  if (viewerId) {
    const viewerDoc = await db.collection('users').doc(viewerId).get();
    const viewerProfile = viewerDoc.data() as any;
    if (viewerProfile) {
      return filtered
        .map((profile) => ({ profile, score: scoreCandidate(viewerProfile, profile) }))
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.profile);
    }
  }

  return filtered;
}

export async function upsertProfile(userId: string, payload: BaseProfileFormValues) {
  const { db } = getAdminServices();
  const parsed = baseProfileSchema.parse(payload);
  await db.collection('users').doc(userId).set(
    {
      ...parsed,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  await db.collection('profiles_public').doc(userId).set(
    {
      id: userId,
      fullName: parsed.fullName,
      role: parsed.role,
      occupation: parsed.occupation,
      province: parsed.province,
      city: parsed.city,
      specialties: parsed.specialties,
      languages: parsed.languages,
      bioShort: parsed.bioShort,
      photoUrl: parsed['photoUrl'] ?? null,
      discoverable: parsed.discoverable,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
