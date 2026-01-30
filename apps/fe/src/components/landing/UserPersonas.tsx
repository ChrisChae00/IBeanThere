import { getTranslations } from 'next-intl/server';
import UserPersonasClient from './UserPersonasClient';

type UserPersonasProps = {
  locale: string;
};

export default async function UserPersonas({ locale }: UserPersonasProps) {
  const t = await getTranslations({ locale, namespace: 'landing.user_personas' });

  const messages = {
    navigator: { 
        title: t('navigator.title'), 
        description: t('navigator.description') 
    },
    archivist: { 
        title: t('archivist.title'), 
        description: t('archivist.description') 
    },
    curator: { 
        title: t('curator.title'), 
        description: t('curator.description') 
    },
  };

  return (
    <section className="py-20 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-[var(--color-textSecondary)]">
            {t('subtitle')}
          </p>
        </div>

        <UserPersonasClient messages={messages} />
      </div>
    </section>
  );
}
