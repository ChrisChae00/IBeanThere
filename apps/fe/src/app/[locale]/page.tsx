import { Hero, Features, CTA, GrowthJourney, UserPersonas } from '@/components/landing';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <>
      <Hero locale={locale} />
      <Features locale={locale} />
      <GrowthJourney locale={locale} />
      <UserPersonas locale={locale} />
      <CTA locale={locale} />
    </>
  );
}
