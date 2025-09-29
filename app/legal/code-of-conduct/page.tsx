export default function CodeOfConductPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">Code of Conduct</h1>
      <p className="mt-4 text-sm text-slate-600">
        MentorMatch SA is a professional space. Treat all members with respect, protect patient privacy, and support safe
        learning environments. Harassment, discrimination, or solicitation of paid services is not permitted and may lead to
        suspension.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-slate-900">Expectations</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-600">
        <li>Keep mentorship conversations confidential and avoid sharing identifiable patient information.</li>
        <li>Use inclusive language and consider cultural and linguistic diversity across South Africa.</li>
        <li>Report concerns promptly so our moderation team can act.</li>
      </ul>
    </div>
  );
}
