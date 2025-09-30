import { z } from 'zod';
import {
  FACILITY_TYPES,
  LANGUAGES,
  MEETING_MODES,
  MENTORSHIP_STYLES,
  OCCUPATIONS,
  PROVINCES,
  STAGES,
} from '@/lib/const/enums';

const phoneRegex = /^\+?[1-9]\d{7,14}$/;
const councilRegex = /^[A-Za-z0-9\-]{4,20}$/;

export const baseProfileSchema = z.object({
  fullName: z.string().min(2),
  preferredName: z.string().optional(),
  email: z.string().email(),
  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  role: z.enum(['Mentor', 'Mentee', 'Both']),
  occupation: z.enum(OCCUPATIONS),
  councilNumber: z
    .string()
    .regex(councilRegex, 'Invalid council number')
    .optional()
    .or(z.literal('')),
  yearsQualified: z.number().int().min(0).max(50),
  stage: z.enum(STAGES),
  province: z.enum(PROVINCES),
  city: z.string().min(2),
  facilityType: z.enum(FACILITY_TYPES),
  languages: z.array(z.enum(LANGUAGES)).min(1),
  specialties: z.array(z.string()).min(1),
  interests: z.array(z.string()).default([]),
  bioShort: z.string().max(280),
  bioLong: z.string().max(2000).optional(),
  photoUrl: z.string().url().optional(),
  education: z.array(
    z.object({
      institution: z.string(),
      graduationYear: z.string().regex(/^(19|20)\d{2}$/),
    }),
  ),
  experience: z.array(
    z.object({
      organisation: z.string(),
      role: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
    }),
  ),
  certifications: z.array(z.string()).optional(),
  links: z
    .object({
      linkedin: z.string().url().optional(),
      website: z.string().url().optional(),
      calendar: z.string().url().optional(),
      research: z.string().url().optional(),
    })
    .optional(),
  discoverable: z.boolean().default(true),
  consentShareProfile: z.boolean().default(false),
  meetingModes: z.array(z.enum(MEETING_MODES)).min(1),
  mentorshipStyle: z.enum(MENTORSHIP_STYLES).optional(),
  mentorPreferences: z
    .object({
      capacity: z.number().int().min(1).max(20),
      expectedCommitment: z.string().optional(),
      preferredDays: z.array(z.string()).default([]),
      preferredTimes: z.array(z.string()).default([]),
      locations: z.array(z.string()).default([]),
    })
    .optional(),
  menteeGoals: z.array(z.string()).default([]),
  menteeAvailability: z.array(z.string()).default([]),
  meetingModePreference: z.enum(MEETING_MODES).optional(),
  mentorshipGoals: z
    .array(z.object({ title: z.string(), description: z.string().optional() }))
    .optional(),
  consentedPolicies: z.boolean(),
  ageConfirmed: z.boolean(),
});

export type BaseProfileFormValues = z.infer<typeof baseProfileSchema>;

export const requestSchema = z.object({
  receiverUserId: z.string(),
  message: z.string().min(10),
  goals: z.array(z.string()).min(1),
});

export const matchMessageSchema = z.object({
  matchId: z.string(),
  body: z.string().min(1),
  type: z.enum(['text', 'image', 'file']).default('text'),
});

export const reportSchema = z.object({
  targetUserId: z.string(),
  category: z.string(),
  details: z.string().min(10),
});

export const discoveryFiltersSchema = z.object({
  roleWanted: z.enum(['Mentor', 'Mentee', 'Both']).optional(),
  occupation: z.string().optional(),
  province: z.string().optional(),
  languages: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  virtualOnly: z.boolean().optional(),
  availableDay: z.string().optional(),
});
