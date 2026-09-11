import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { CoffeeCategory, CoffeeDrink, Locale } from '@/data/coffee/types';
import MapPrompt from './MapPrompt';
import { DrinkList, SourceNote, TEXT_LINK, formatDay } from './GuideParts';

/*
  One drink, readable from a cold start: the answer first, the facts that define it,
  then one section per question the page answers. Everything is in the server HTML;
  nothing waits on a click or an animation.
*/
export default async function CoffeeDrinkDetail({
  drink,
  category,
  related,
  locale,
}: {
  drink: CoffeeDrink;
  category: CoffeeCategory;
  related: CoffeeDrink[];
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: 'learn.coffee' });
  const loc = locale as Locale;
  const copy = drink.content[loc];
  const guideHref = `/${locale}/learn/coffee`;
  const sourceLabel = (count: number) => (count > 1 ? t('sources') : t('source'));

  return (
    <article className="paper-grain mx-auto max-w-3xl break-keep px-4 pb-20 pt-8 sm:px-6">
      <nav aria-label={t('breadcrumbRoot')}>
        <ol className="landing-micro flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-secondary">
          <li>
            <Link href={guideHref} className={`${TEXT_LINK} text-ink-secondary`}>
              {t('breadcrumbRoot')}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`${guideHref}#${category.id}`} className={`${TEXT_LINK} text-ink-secondary`}>
              {category.content[loc].name}
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mt-8">
        <h1 className="landing-display text-[clamp(2.75rem,9vw,5rem)] text-ink-primary">{copy.name}</h1>
        {copy.aka && <p className="mt-4 text-sm text-ink-secondary">{copy.aka}</p>}
        <p className="mt-6 text-xl leading-relaxed text-ink-primary">{copy.summary}</p>
        <SourceNote ids={copy.summarySources} label={sourceLabel(copy.summarySources?.length ?? 0)} className="mt-3" />
      </header>

      <section aria-labelledby="at-a-glance" className="mt-10">
        <h2 id="at-a-glance" className="landing-micro text-ink-secondary">
          {t('atAGlance')}
        </h2>
        <dl className="mt-3 divide-y divide-edge-rule border-y border-edge-rule">
          {copy.facts.map(fact => (
            <div key={fact.label} className="grid gap-x-6 gap-y-0.5 py-3 sm:grid-cols-[11rem_1fr]">
              <dt className="text-sm text-ink-secondary">{fact.label}</dt>
              <dd className="text-ink-primary">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {copy.sections.map(section => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="mt-14 scroll-mt-24">
          <h2 id={`${section.id}-heading`} className="font-display text-2xl leading-snug text-ink-primary sm:text-3xl">
            {section.heading}
          </h2>
          {section.body.map((paragraph, i) => (
            <div key={i} className="mt-4">
              <p className="max-w-[65ch] text-[1.0625rem] leading-[1.75] text-ink-primary">{paragraph.text}</p>
              <SourceNote ids={paragraph.sources} label={sourceLabel(paragraph.sources?.length ?? 0)} />
            </div>
          ))}
        </section>
      ))}

      {related.length > 0 && (
        <section aria-labelledby="read-next" className="mt-16">
          <h2 id="read-next" className="landing-micro mb-3 text-ink-secondary">
            {t('readNext')}
          </h2>
          <DrinkList drinks={related} locale={locale} />
        </section>
      )}

      <MapPrompt
        locale={locale}
        text={category.cta === 'beans' ? t('ctaBeans') : t('ctaCafe')}
        button={t('ctaButton')}
        cta={category.cta}
        page="drink"
      />

      <footer className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-secondary">
        <p>
          {t.rich('checked', {
            date: formatDay(drink.reviewed, locale),
            time: chunks => <time dateTime={drink.reviewed}>{chunks}</time>,
          })}
        </p>
        <Link href={guideHref} className={`${TEXT_LINK} text-ink-secondary`}>
          {t('backToGuide')}
        </Link>
      </footer>
    </article>
  );
}
