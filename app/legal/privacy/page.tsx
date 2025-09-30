export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">
        Privacy Notice (POPIA)
      </h1>
      <p className="mt-4 text-sm text-slate-600">
        We collect only the minimum personal information required to connect
        mentors and mentees. Your profile is visible to authenticated community
        members when discoverability is enabled. You may request access,
        correction, or deletion of your data at any time by contacting
        privacy@mentormatchsa.org. Data is hosted on Firebase in regions that
        offer POPIA-aligned safeguards.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-slate-900">
        How we use your data
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-600">
        <li>
          Authenticate your account and secure access to mentorship tools.
        </li>
        <li>
          Surface relevant matches and notify you about mentorship activity.
        </li>
        <li>Improve platform safety through aggregated analytics.</li>
      </ul>
    </div>
  );
}
