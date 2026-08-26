import HeroBackdrop from './HeroBackdrop';

export default async function Hero({ locale }: { locale: string }) {
  return (
    // Pulled up under the fixed header so the photo runs behind it. The id is
    // what the header watches to know it is still over media.
    <section id="hero" className="overflow-hidden -mt-16">
      <HeroBackdrop locale={locale} />
    </section>
  );
}

