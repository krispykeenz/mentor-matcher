import { describe, expect, it } from 'vitest';
import { scoreCandidate } from '@/lib/utils/matching';

describe('scoreCandidate', () => {
  const viewer = {
    occupation: 'Physiotherapist',
    province: 'WC',
    city: 'Cape Town',
    languages: ['English', 'Afrikaans'],
    specialties: ['Musculoskeletal', 'Sports'],
    menteeAvailability: ['Evenings'],
  };

  it('rewards shared occupation and province', () => {
    const candidate = {
      occupation: 'Physiotherapist',
      province: 'WC',
      city: 'Cape Town',
      languages: ['English'],
      specialties: ['Musculoskeletal'],
      mentorPreferences: { capacity: 3, acceptedCount: 1, preferredTimes: ['Evenings'] },
    };
    const score = scoreCandidate(viewer as any, candidate as any);
    expect(score).toBeGreaterThan(0);
  });

  it('penalises lack of overlap', () => {
    const candidate = {
      occupation: 'Pharmacist',
      province: 'GP',
      languages: ['isiZulu'],
      specialties: ['Regulatory Affairs'],
    };
    const score = scoreCandidate(viewer as any, candidate as any);
    expect(score).toBeLessThan(2);
  });
});
