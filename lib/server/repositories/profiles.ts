import { getAdminServices } from '@/lib/firebase/server';
import {
  discoveryFiltersSchema,
  baseProfileSchema,
  type BaseProfileFormValues,
} from '@/lib/utils/schemas';
import { scoreCandidate } from '@/lib/utils/matching';

export async function fetchDiscoveryProfiles(
  query: Record<string, unknown>,
  viewerId?: string,
) {
  const filters = discoveryFiltersSchema.partial().parse(query);
  const { db } = getAdminServices();
  // Composite indexes required:
  // profiles_public: discoverable ASC, province ASC, occupation ASC
  // profiles_public: discoverable ASC, languages ARRAY
  let ref = db
    .collection('profiles_public')
    .where('discoverable', '==', true)
    .limit(50);

  if (filters.roleWanted) {
    ref = ref.where('role', '==', filters.roleWanted);
  }
  if (filters.occupation) {
    ref = ref.where('occupation', '==', filters.occupation);
  }
  if (filters.province) {
    ref = ref.where('province', '==', filters.province);
  }
  if ((filters as any).gender) {
    ref = ref.where('gender', '==', (filters as any).gender);
  }

  const snapshot = await ref.get();
  const profiles = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as any,
  );
  const filtered = filters.languages?.length
    ? profiles.filter((profile) =>
        profile.languages?.some((language: string) =>
          filters.languages!.includes(language),
        ),
      )
    : profiles;

  if (viewerId) {
    const viewerDoc = await db.collection('users').doc(viewerId).get();
    const viewerProfile = viewerDoc.data() as any;
    if (viewerProfile) {
      return filtered
        .map((profile) => ({
          profile,
          score: scoreCandidate(viewerProfile, profile),
        }))
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.profile);
    }
  }

  return filtered;
}

export async function upsertProfile(
  userId: string,
  payload: BaseProfileFormValues,
) {
  const { db, storage } = getAdminServices();
  const parsed = baseProfileSchema.parse(payload);

  // Fetch existing profile to detect old photo for cleanup
  const existingSnap = await db.collection('users').doc(userId).get();
  const existing = (existingSnap.exists ? (existingSnap.data() as any) : null) || {};
  const oldPhotoUrl: string | null = existing.photoUrl ?? null;
  const newPhotoUrl: string | null = parsed.photoUrl ?? null;

  // Update private user profile
  await db
    .collection('users')
    .doc(userId)
    .set(
      {
        ...parsed,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

  // Update public profile
  await db
    .collection('profiles_public')
    .doc(userId)
    .set(
      {
        id: userId,
        fullName: parsed.fullName,
        role: parsed.role,
        occupation: parsed.occupation,
        province: parsed.province,
        city: parsed.city,
        gender: parsed.gender ?? null,
        specialties: parsed.specialties,
        languages: parsed.languages,
        bioShort: parsed.bioShort,
        photoUrl: parsed.photoUrl ?? null,
        discoverable: parsed.discoverable,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

  // Best-effort cleanup: delete old avatar if replaced
  if (oldPhotoUrl && newPhotoUrl && oldPhotoUrl !== newPhotoUrl) {
    try {
      const match = /\/o\/([^?]+)/.exec(oldPhotoUrl);
      if (match && match[1]) {
        const objectPath = decodeURIComponent(match[1]);
        // Only delete user-owned avatar files for safety
        if (objectPath.startsWith(`avatars/${userId}/`)) {
          await storage.bucket().file(objectPath).delete({ ignoreNotFound: true });
        }
      }
    } catch (err) {
      // Swallow errors to avoid failing the profile update due to cleanup
      console.warn('Avatar cleanup failed', err);
    }
  }
}
