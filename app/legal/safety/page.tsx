export default function SafetyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">Safety Tips</h1>
      <p className="mt-4 text-sm text-slate-600">
        Protect yourself and your mentees by keeping communications respectful and documented. Do not share personal patient
        information, and never meet in-person unless you feel comfortable and follow workplace protocols. If anything feels
        unsafe, block the user and alert safety@mentormatchsa.org.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-6 text-sm text-slate-600">
        <li>Use in-app messaging until trust is established.</li>
        <li>Confirm professional identities before exchanging sensitive documents.</li>
        <li>Escalate serious concerns to professional councils or local authorities as needed.</li>
      </ul>
    </div>
  );
}
