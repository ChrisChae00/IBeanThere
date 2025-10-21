import { Hero, Features, Stats, Testimonials, CTA } from '@/components/landing';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <main>
      <Hero locale={locale} />
      <Features locale={locale} />
      <Stats locale={locale} />
      <Testimonials locale={locale} />
      <CTA locale={locale} />
    </main>
  );
}
