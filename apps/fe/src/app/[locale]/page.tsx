import { Hero, CTA, BeanDropTimeline, UserPersonas, CafeRegister } from '@/components/landing';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <>
      <Hero locale={locale} />
<BeanDropTimeline locale={locale} />
      <CafeRegister locale={locale} />
      <UserPersonas locale={locale} />
      <CTA locale={locale} />
    </>
  );
}
