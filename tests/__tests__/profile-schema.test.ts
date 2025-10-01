import { describe, expect, it } from 'vitest';
import { baseProfileSchema } from '@/lib/utils/schemas';
import { OCCUPATIONS, STAGES, PROVINCES, FACILITY_TYPES, LANGUAGES, MEETING_MODES } from '@/lib/const/enums';

const minimalValid = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '',
  role: 'Mentee' as const,
  occupation: OCCUPATIONS[0],
  yearsQualified: 0,
  stage: STAGES[0],
  province: PROVINCES[0],
  city: 'City',
  facilityType: FACILITY_TYPES[0],
  languages: [LANGUAGES[0]],
  specialties: ['Musculoskeletal'],
  bioShort: 'Short bio',
  meetingModes: [MEETING_MODES[1]],
  consentedPolicies: true,
  ageConfirmed: true,
};

describe('baseProfileSchema', () => {
  it('accepts a minimal valid payload', () => {
    const parsed = baseProfileSchema.parse(minimalValid);
    expect(parsed.fullName).toBe('Jane Doe');
    expect(parsed.discoverable).toBeTypeOf('boolean');
  });

  it('rejects empty languages', () => {
    expect(() =>
      baseProfileSchema.parse({ ...minimalValid, languages: [] }),
    ).toThrowError(/Required/);
  });

  it('rejects invalid email', () => {
    expect(() =>
      baseProfileSchema.parse({ ...minimalValid, email: 'not-an-email' }),
    ).toThrowError();
  });

  it('rejects missing consent flags', () => {
    const { consentedPolicies, ageConfirmed, ...rest } = minimalValid;
    expect(() => baseProfileSchema.parse(rest as any)).toThrowError();
  });

  it('rejects invalid phone number', () => {
    expect(() =>
      baseProfileSchema.parse({ ...minimalValid, phone: '12345' }),
    ).toThrowError(/Invalid phone number/);
  });
});
