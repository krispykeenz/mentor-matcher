import type { BaseProfileFormValues } from '@/lib/utils/schemas';

export interface CandidateScoreContext {
  weights?: Partial<typeof defaultWeights>;
}

const defaultWeights = {
  occupation: 3,
  province: 2,
  availability: 2,
  languages: 2,
  specialties: 3,
  mentorCapacity: 1.5,
  newUserBonus: 1,
};

export function scoreCandidate(
  viewer: Partial<BaseProfileFormValues> & {
    id?: string;
    analytics?: { likesSent?: number };
  },
  candidate: Partial<BaseProfileFormValues> & {
    id?: string;
    createdAt?: string | number;
    mentorPreferences?: { capacity?: number; acceptedCount?: number };
    languages?: string[];
    specialties?: string[];
  },
  context: CandidateScoreContext = {},
) {
  const weights = { ...defaultWeights, ...context.weights };
  let score = 0;

  if (
    viewer.occupation &&
    candidate.occupation &&
    viewer.occupation === candidate.occupation
  ) {
    score += weights.occupation;
  }

  if (viewer.province && candidate.province) {
    score += viewer.province === candidate.province ? weights.province : 0;
    if (viewer.city && candidate.city && viewer.city === candidate.city) {
      score += 1;
    }
  }

  const sharedLanguages = intersect(
    viewer.languages ?? [],
    candidate.languages ?? [],
  );
  if (sharedLanguages.length) {
    score += weights.languages * sharedLanguages.length;
  }

  const sharedSpecialties = intersect(
    viewer.specialties ?? [],
    candidate.specialties ?? [],
  );
  if (sharedSpecialties.length) {
    score += weights.specialties * sharedSpecialties.length;
  }

  if (candidate.mentorPreferences?.capacity) {
    const remaining = Math.max(
      candidate.mentorPreferences.capacity -
        (candidate.mentorPreferences.acceptedCount ?? 0),
      0,
    );
    score +=
      weights.mentorCapacity *
      Math.min(remaining, candidate.mentorPreferences.capacity);
  }

  if (candidate.createdAt) {
    const ageInDays =
      (Date.now() - new Date(candidate.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (ageInDays < 14) {
      score += weights.newUserBonus;
    }
  }

  if (
    viewer['menteeAvailability'] &&
    candidate['mentorPreferences']?.preferredTimes
  ) {
    const sharedAvailability = intersect(
      viewer['menteeAvailability'] as string[],
      (candidate['mentorPreferences']?.preferredTimes as string[]) ?? [],
    );
    if (sharedAvailability.length) {
      score += weights.availability;
    }
  }

  return score;
}

function intersect<T>(a: T[], b: T[]) {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
}
