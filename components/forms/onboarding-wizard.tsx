'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  baseProfileSchema,
  type BaseProfileFormValues,
} from '@/lib/utils/schemas';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/components/ui/progress';
import {
  OCCUPATIONS,
  PROVINCES,
  LANGUAGES,
  FACILITY_TYPES,
  MENTORSHIP_STYLES,
} from '@/lib/const/enums';
import { MultiSelect } from '@/components/ui/multi-select';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const specialtiesList = [
  'Musculoskeletal',
  'Neurology',
  'Paediatrics',
  'Cardio-respiratory',
  'Sports',
  'Geriatrics',
  'Mental Health',
  'Community Rehab',
  'Hospital Pharmacy',
  'Community Pharmacy',
  'Regulatory Affairs',
  'Radiography',
  'Rehabilitation',
];

const initialValues: BaseProfileFormValues = {
  fullName: '',
  preferredName: '',
  email: '',
  phone: '',
  role: 'Mentee',
  occupation: 'Physiotherapist',
  councilNumber: '',
  yearsQualified: 0,
  stage: 'Community Service',
  province: 'GP',
  city: '',
  facilityType: 'Clinic',
  languages: ['English'],
  specialties: ['Musculoskeletal'],
  interests: [],
  bioShort: '',
  bioLong: '',
  education: [],
  experience: [],
  certifications: [],
  links: {
    linkedin: undefined,
    website: undefined,
    calendar: undefined,
    research: undefined,
  },
  discoverable: true,
  consentShareProfile: false,
  meetingModes: ['Virtual'],
  mentorshipStyle: 'Collaborative',
  mentorPreferences: {
    capacity: 1,
    expectedCommitment: '',
    preferredDays: [],
    preferredTimes: [],
    locations: [],
  },
  menteeGoals: [],
  menteeAvailability: [],
  meetingModePreference: 'Virtual',
  mentorshipGoals: [],
  consentedPolicies: false,
  ageConfirmed: false,
};

const steps = [
  { id: 0, label: 'Basics' },
  { id: 1, label: 'Professional' },
  { id: 2, label: 'Mentorship' },
  { id: 3, label: 'Safety' },
];

const stepFieldMap: Record<number, string[]> = {
  0: ['fullName', 'email', 'phone', 'role', 'occupation'],
  1: [
    'province',
    'city',
    'facilityType',
    'languages',
    'specialties',
    'bioShort',
  ],
  2: ['mentorshipStyle', 'meetingModes', 'mentorPreferences.capacity'],
  3: ['consentedPolicies', 'ageConfirmed'],
};

export function OnboardingWizard({
  profile,
}: {
  profile?: Partial<BaseProfileFormValues>;
}) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const form = useForm<BaseProfileFormValues>({
    resolver: zodResolver(baseProfileSchema),
    defaultValues: profile ? { ...initialValues, ...profile } : initialValues,
  });

  const consentedPolicies = form.watch('consentedPolicies') ?? false;
  const ageConfirmed = form.watch('ageConfirmed') ?? false;

  const handlePoliciesConsentChange = (checked: boolean | 'indeterminate') => {
    const value = checked === true;
    if (form.getValues('consentedPolicies') !== value) {
      form.setValue('consentedPolicies', value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleAgeConfirmedChange = (checked: boolean | 'indeterminate') => {
    const value = checked === true;
    if (form.getValues('ageConfirmed') !== value) {
      form.setValue('ageConfirmed', value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: BaseProfileFormValues) => {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Profile saved. Welcome to MentorMatch SA!');
      router.push('/discover');
    },
    onError: (error: unknown) => {
      console.error(error);
      toast.error('Could not save profile');
    },
  });

  const nextStep = async () => {
    const fields = stepFieldMap[step] ?? [];
    if (fields.length) {
      const isValid = await form.trigger(fields as any, { shouldFocus: true });
      if (!isValid) {
        toast.error('Please complete the required fields before continuing.');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = form.handleSubmit(
    (values) => mutation.mutate(values),
    () => {
      toast.error('Please fix the highlighted fields before continuing.');
    },
  );

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-600">
              Onboarding
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              {steps[step]?.label}
            </h2>
          </div>
          <span className="text-sm text-slate-500">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {step === 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...form.register('fullName')} />
            <p className="text-xs text-red-500">
              {form.formState.errors.fullName?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredName">Preferred name</Label>
            <Input id="preferredName" {...form.register('preferredName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
            <p className="text-xs text-red-500">
              {form.formState.errors.email?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+27" {...form.register('phone')} />
            <p className="text-xs text-red-500">
              {form.formState.errors.phone?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-3">
              {['Mentor', 'Mentee', 'Both'].map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2"
                >
                  <input type="radio" value={role} {...form.register('role')} />
                  <span className="text-sm">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Select
              value={form.watch('occupation')}
              onValueChange={(value) =>
                form.setValue('occupation', value as any)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {OCCUPATIONS.map((occupation) => (
                  <SelectItem key={occupation} value={occupation}>
                    {occupation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Select
              value={form.watch('province')}
              onValueChange={(value) => form.setValue('province', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">District / City</Label>
            <Input id="city" {...form.register('city')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facilityType">Facility Type</Label>
            <Select
              value={form.watch('facilityType')}
              onValueChange={(value) =>
                form.setValue('facilityType', value as any)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                {FACILITY_TYPES.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Languages</Label>
            <MultiSelect
              values={form.watch('languages')}
              options={LANGUAGES.map((language) => ({
                label: language,
                value: language,
              }))}
              onChange={(values) => form.setValue('languages', values as any)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Specialties</Label>
            <MultiSelect
              values={form.watch('specialties')}
              options={specialtiesList.map((specialty) => ({
                label: specialty,
                value: specialty,
              }))}
              onChange={(values) => form.setValue('specialties', values)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bioShort">Short bio</Label>
            <Textarea id="bioShort" rows={3} {...form.register('bioShort')} />
            <p className="text-xs text-red-500">
              {form.formState.errors.bioShort?.message}
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mentorshipStyle">Preferred mentorship style</Label>
            <Select
              value={form.watch('mentorshipStyle') || 'Collaborative'}
              onValueChange={(value) =>
                form.setValue('mentorshipStyle', value as any)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {MENTORSHIP_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bioLong">Extended bio</Label>
            <Textarea id="bioLong" rows={5} {...form.register('bioLong')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Meeting modes</Label>
            <MultiSelect
              values={form.watch('meetingModes')}
              options={[
                { label: 'In-person', value: 'In-person' },
                { label: 'Virtual', value: 'Virtual' },
                { label: 'Hybrid', value: 'Hybrid' },
              ]}
              onChange={(values) =>
                form.setValue('meetingModes', values as any)
              }
            />
          </div>
          {form.watch('role') !== 'Mentee' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mentorCapacity">Mentor capacity</Label>
              <Input
                id="mentorCapacity"
                type="number"
                min={1}
                max={20}
                {...form.register('mentorPreferences.capacity', {
                  valueAsNumber: true,
                })}
              />
            </div>
          )}
          {form.watch('role') !== 'Mentor' && (
            <div className="space-y-2 md:col-span-2">
              <Label>Mentee goals</Label>
              <Textarea
                rows={4}
                placeholder="Share your goals, e.g. developing rural rehab pathways, preparing for exit exams…"
                value={(form.watch('menteeGoals') ?? []).join('\n')}
                onChange={(event) =>
                  form.setValue(
                    'menteeGoals',
                    event.target.value.split('\n').filter(Boolean),
                  )
                }
              />
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={consentedPolicies}
              onCheckedChange={handlePoliciesConsentChange}
            />
            <div className="space-y-1 text-sm">
              <p>
                I agree to the{' '}
                <a className="underline" href="/legal/code-of-conduct">
                  Code of Conduct
                </a>
                ,{' '}
                <a className="underline" href="/legal/terms">
                  Terms of Use
                </a>{' '}
                and{' '}
                <a className="underline" href="/legal/privacy">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={ageConfirmed}
              onCheckedChange={handleAgeConfirmedChange}
            />
            <span>I confirm I am 18 years or older.</span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={prevStep}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={() => void nextStep()}>
            Continue
          </Button>
        ) : (
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Complete onboarding'}
          </Button>
        )}
      </div>
    </form>
  );
}
