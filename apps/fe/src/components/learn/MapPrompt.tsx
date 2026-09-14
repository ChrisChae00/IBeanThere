'use client';

import Link from 'next/link';
import { capture } from '@/lib/analytics';

/*
  The guide's one ask, after the reading is done. It sends nothing but which prompt
  was taken and from which kind of page; the drink stays out of it, the same way its
  slug is masked in the path.
*/
export default function MapPrompt({
  locale,
  text,
  button,
  cta,
  page,
}: {
  locale: string;
  text: string;
  button: string;
  cta: 'cafe' | 'beans';
  page: 'guide' | 'drink';
}) {
  return (
    <section className="mt-16 flex flex-col gap-5 border-t border-edge-rule pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <p className="max-w-[44ch] text-lg leading-snug text-ink-primary">{text}</p>
      <Link
        href={`/${locale}/discover/explore-map`}
        onClick={() => capture('learn_cta_clicked', { cta, page })}
        className="landing-micro btn-fill btn-shade inline-flex min-h-[52px] w-fit shrink-0 items-center rounded-control px-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {button}
      </Link>
    </section>
  );
}
