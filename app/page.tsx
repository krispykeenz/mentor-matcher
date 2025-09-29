import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShieldCheck, Users } from 'lucide-react';

const features = [
  {
    title: 'Smart Matching',
    description:
      'Swipe through mentors and mentees tailored to your goals, availability, and location across South Africa.',
  },
  {
    title: 'Structured Mentorship',
    description:
      'Define goals, track commitments, and collaborate safely with POPIA-aligned controls and moderation.',
  },
  {
    title: 'Community First',
    description:
      'Designed with community service health professionals in mind — across public and private sectors.',
  },
];

const testimonials = [
  {
    name: 'Ayanda M.',
    role: 'Community Service Physiotherapist, Eastern Cape',
    quote:
      'MentorMatch SA helped me find a mentor who understands rural rehab realities. The weekly check-ins have been invaluable.',
  },
  {
    name: 'Dr. Lindiwe K.',
    role: 'Paediatric Occupational Therapist, Gauteng',
    quote:
      'I can mentor meaningfully without overwhelming my schedule. The discovery filters are thoughtful and inclusive.',
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-sand-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <ShieldCheck className="h-3.5 w-3.5" /> POPIA-conscious mentorship for health professionals
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            MentorMatch SA
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
            A mobile-first mentorship network built for South African community-service health professionals. Discover
            mentors and mentees, align on goals, and grow together.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/onboarding">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </header>

      <section id="how-it-works" className="bg-white py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="space-y-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-sand-100 py-16">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardContent className="space-y-4 p-6">
                <p className="text-base text-slate-700">“{testimonial.quote}”</p>
                <div className="text-sm font-semibold text-slate-900">{testimonial.name}</div>
                <div className="text-xs text-slate-500">{testimonial.role}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Ready to connect?</h2>
          <p className="max-w-2xl text-sm text-slate-600">
            MentorMatch SA is free during beta. Access curated mentors, structured templates, and a safe space to learn.
          </p>
          <Button asChild size="lg">
            <Link className="inline-flex items-center gap-2" href="/onboarding">
              Join the beta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="bg-slate-900 py-10 text-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm">© {new Date().getFullYear()} MentorMatch SA. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/legal/terms" className="hover:text-white">
              Terms of Use
            </Link>
            <Link href="/legal/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/legal/code-of-conduct" className="hover:text-white">
              Code of Conduct
            </Link>
            <Link href="/legal/community-guidelines" className="hover:text-white">
              Community Guidelines
            </Link>
            <Link href="/legal/safety" className="hover:text-white">
              Safety Tips
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
