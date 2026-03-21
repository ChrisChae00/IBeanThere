import HeroSlideshow from './HeroSlideshow';

export default async function Hero({ locale }: { locale: string }) {
  return (
    <section className="overflow-hidden">
      <HeroSlideshow locale={locale} />
    </section>
  );
}

