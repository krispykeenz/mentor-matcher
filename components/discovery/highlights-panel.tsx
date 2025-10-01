"use client";

import { useMemo } from "react";
import type { DiscoveryProfile } from "@/components/discovery/profile-card";

type Viewer = {
  fullName?: string;
  occupation?: string;
  province?: string;
  city?: string;
  languages?: string[];
  specialties?: string[];
};

function intersect<T>(a: T[] = [], b: T[] = []) {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

export function HighlightsPanel({
  active,
  viewer,
}: {
  active: DiscoveryProfile | null;
  viewer: Viewer | null;
}) {
  const sharedLanguages = useMemo(
    () => intersect(viewer?.languages ?? [], active?.languages ?? []),
    [viewer, active]
  );
  const sharedSpecialties = useMemo(
    () => intersect(viewer?.specialties ?? [], active?.specialties ?? []),
    [viewer, active]
  );

  const sameOccupation = Boolean(
    viewer?.occupation && active?.occupation && viewer.occupation === active.occupation,
  );
  const sameProvince = Boolean(
    viewer?.province && active?.province && viewer.province === active.province,
  );

  return (
    <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-soft backdrop-blur lg:block lg:w-[340px]">
      <p className="mb-2 text-sm font-medium text-slate-700">Highlights</p>
      {!active ? (
        <p className="text-xs text-slate-500">Browse profiles to see overlaps here.</p>
      ) : !viewer ? (
        <p className="text-xs text-slate-500">Sign in and complete your profile to see shared details.</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-600">Shared languages</p>
            {sharedLanguages.length ? (
              <div className="mt-1 flex flex-wrap gap-2">
                {sharedLanguages.map((lang) => (
                  <span key={lang} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{lang}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No language overlap yet</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Shared specialties</p>
            {sharedSpecialties.length ? (
              <div className="mt-1 flex flex-wrap gap-2">
                {sharedSpecialties.map((spec) => (
                  <span key={spec} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{spec}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No specialty overlap yet</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`rounded-xl border px-2 py-1 ${sameOccupation ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600'}`}>
              Same occupation
            </div>
            <div className={`rounded-xl border px-2 py-1 ${sameProvince ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600'}`}>
              Same province
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
