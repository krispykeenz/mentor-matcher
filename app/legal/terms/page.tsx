export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">Terms of Use</h1>
      <p className="mt-4 text-sm text-slate-600">
        By accessing MentorMatch SA you agree to act professionally, protect
        confidential information, and comply with South African regulations
        governing patient care and mentorship. These terms outline acceptable
        use, community responsibilities, and limitations of liability.
        Participation is voluntary and you may deactivate your profile at any
        time by contacting support.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-slate-900">Key points</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-600">
        <li>
          Mentorship support complements, but does not replace, professional
          supervision or employer obligations.
        </li>
        <li>
          Users must be 18 years or older and accurately represent their
          professional status.
        </li>
        <li>
          Report any misconduct via the in-app reporting tools or email
          safety@mentormatchsa.org.
        </li>
      </ul>
    </div>
  );
}
