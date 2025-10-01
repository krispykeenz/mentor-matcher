"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OCCUPATIONS, PROVINCES } from "@/lib/const/enums";

export type QuickFilters = {
  roleWanted?: "Mentor" | "Mentee" | "Both";
  gender?: "Male" | "Female";
  province?: string;
  occupation?: string;
};

export function QuickFiltersPanel({
  value,
  onChange,
}: {
  value: QuickFilters;
  onChange: (next: QuickFilters) => void;
}) {
  const roles: QuickFilters["roleWanted"][] = ["Mentor", "Mentee", "Both"];
  const genders: (QuickFilters["gender"] | "Any")[] = ["Any", "Male", "Female"];

  const roleButtons = useMemo(
    () =>
      roles.map((r) => (
        <Button
          key={r}
          type="button"
          variant={value.roleWanted === r ? "default" : "outline"}
          size="sm"
          onClick={() => onChange({ ...value, roleWanted: r })}
        >
          {r}
        </Button>
      )),
    [roles, value, onChange]
  );

  const genderButtons = useMemo(
    () =>
      genders.map((g) => (
        <Button
          key={g}
          type="button"
          variant={(!value.gender && g === "Any") || value.gender === g ? "default" : "outline"}
          size="sm"
          onClick={() => onChange({ ...value, gender: g === "Any" ? undefined : (g as "Male" | "Female") })}
        >
          {g}
        </Button>
      )),
    [genders, value, onChange]
  );

  return (
    <aside className="hidden h-fit gap-6 self-start rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-soft backdrop-blur lg:block lg:w-[340px]">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Quick filters</p>
        <div className="grid grid-cols-3 gap-2">{roleButtons}</div>
        <div className="grid grid-cols-3 gap-2">{genderButtons}</div>
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Province</p>
          <Select
            value={value.province}
            onValueChange={(p) => onChange({ ...value, province: p })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Occupation</p>
          <Select
            value={value.occupation}
            onValueChange={(o) => onChange({ ...value, occupation: o })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {OCCUPATIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-slate-700">Tips</p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600">
          <li>Try widening your province to increase matches.</li>
          <li>Pick 2–3 specialties to get sharper recommendations.</li>
        </ul>
      </div>
    </aside>
  );
}
