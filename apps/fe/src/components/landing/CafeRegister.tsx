import { getTranslations } from 'next-intl/server';
import CafeRegisterClient from './CafeRegisterClient';

type CafeRegisterProps = {
  locale: string;
};

export default async function CafeRegister({ locale }: CafeRegisterProps) {
  const t = await getTranslations({ locale, namespace: 'landing.cafe_register' });

  const messages = {
    title: t('title'),
    subtitle: t('subtitle'),
    cta: t('cta'),
    accordion: {
      autoFillTitle: t('accordion.auto_fill_title'),
      autoFillDesc: t('accordion.auto_fill_desc'),
      verifiedTitle: t('accordion.verified_title'),
      verifiedDesc: t('accordion.verified_desc'),
      photosTitle: t('accordion.photos_title'),
      photosDesc: t('accordion.photos_desc'),
    },
  };

  return (
    <section
      id="cafe-register"
      className="relative py-10 sm:py-14 md:py-16 bg-[var(--color-primary)] overflow-hidden"
    >
      <CafeRegisterClient messages={messages} locale={locale} />
    </section>
  );
}
