'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { LANGUAGES, OCCUPATIONS, PROVINCES } from '@/lib/const/enums';
import { Filter } from 'lucide-react';

export interface DiscoveryFilters {
  roleWanted?: string;
  occupation?: string;
  province?: string;
  gender?: 'Male' | 'Female';
  languages?: string[];
  specialties?: string[];
}

interface Props {
  onFilterChange: (filters: DiscoveryFilters) => void;
}

const specialties = [
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
];

export function FiltersDrawer({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<DiscoveryFilters>({});

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-2"
        >
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-sm space-y-6 overflow-y-auto bg-white p-6"
      >
        <SheetHeader>
          <SheetTitle>Refine your matches</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Role</p>
            <div className="grid grid-cols-3 gap-2">
              {['Mentor', 'Mentee', 'Both'].map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={filters.roleWanted === role ? 'default' : 'outline'}
                  onClick={() => {
                    const next = { ...filters, roleWanted: role };
                    setFilters(next);
                    onFilterChange(next);
                  }}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Gender</p>
            <div className="grid grid-cols-3 gap-2">
              {['Any', 'Male', 'Female'].map((g) => (
                <Button
                  key={g}
                  type="button"
                  variant={
                    (g === 'Any' && !filters.gender) || filters.gender === g
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() => {
                    const next = { ...filters, gender: g === 'Any' ? undefined : (g as 'Male' | 'Female') };
                    setFilters(next);
                    onFilterChange(next);
                  }}
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Occupation</p>
            <Select
              value={filters.occupation}
              onValueChange={(value) => {
                const next = { ...filters, occupation: value };
                setFilters(next);
                onFilterChange(next);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
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
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Province</p>
            <Select
              value={filters.province}
              onValueChange={(value) => {
                const next = { ...filters, province: value };
                setFilters(next);
                onFilterChange(next);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
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
            <p className="text-sm font-medium text-slate-700">Languages</p>
            <MultiSelect
              values={filters.languages ?? []}
              options={LANGUAGES.map((language) => ({
                label: language,
                value: language,
              }))}
              onChange={(values) => {
                const next = { ...filters, languages: values };
                setFilters(next);
                onFilterChange(next);
              }}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Specialties</p>
            <MultiSelect
              values={filters.specialties ?? []}
              options={specialties.map((specialty) => ({
                label: specialty,
                value: specialty,
              }))}
              onChange={(values) => {
                const next = { ...filters, specialties: values };
                setFilters(next);
                onFilterChange(next);
              }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
