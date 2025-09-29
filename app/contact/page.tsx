export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">Contact</h1>
      <p className="mt-4 text-sm text-slate-600">
        Need help or want to collaborate? Email <a className="text-brand-600 underline" href="mailto:hello@mentormatchsa.org">hello@mentormatchsa.org</a>.
      </p>
      <p className="mt-4 text-sm text-slate-600">
        For privacy requests: <a className="text-brand-600 underline" href="mailto:privacy@mentormatchsa.org">privacy@mentormatchsa.org</a>
      </p>
      <p className="mt-4 text-sm text-slate-600">
        For urgent safety concerns: <a className="text-brand-600 underline" href="mailto:safety@mentormatchsa.org">safety@mentormatchsa.org</a>
      </p>
    </div>
  );
}
