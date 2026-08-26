'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

/*
  Milliseconds of stillness between gusts, measured from the end of the previous
  one rather than on a fixed interval. A wall-clock interval shorter than the
  clip would keep firing while it plays and start the next gust the instant it
  landed; timing the rest from `ended` is what makes the pause a real pause.
*/
const REST_BETWEEN_GUSTS = 2000;

/*
  The clip is a single gust - it builds over about a second and a half and has
  settled by the end - encoded forwards then backwards so its last frame is its
  first. That is what lets it rewind to a standstill without a visible jump: the
  foliage genuinely does not return to its starting position on its own.

  It plays on desktop only. The video is 2.36:1, which crops to a narrow vertical
  slice of itself on a phone, so portrait gets a still framed from the original
  photograph instead.
*/
const DESKTOP_AND_MOTION_OK = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

type HeroBackdropProps = {
  locale: string;
};

export default function HeroBackdrop({ locale }: HeroBackdropProps) {
  const t = useTranslations('landing.hero');
  const { user, isLoading } = useAuth();
  const isLoggedIn = !isLoading && !!user;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const query = window.matchMedia(DESKTOP_AND_MOTION_OK);
    let timer: number | undefined;

    const scheduleGust = () => {
      timer = window.setTimeout(() => {
        // A gust already running swallows its own trigger; nothing queues up.
        if (video.paused) void video.play().catch(() => {});
      }, REST_BETWEEN_GUSTS);
    };
    const settle = () => {
      video.currentTime = 0;
      video.pause();
      scheduleGust();
    };
    const reveal = () => setVideoReady(true);

    const start = () => {
      video.addEventListener('ended', settle);
      video.addEventListener('canplaythrough', reveal);
      // Assigning the source here is what keeps the 3MB off phones entirely.
      video.src = '/pics/hero-loop.mp4';
      scheduleGust();
    };
    const stop = () => {
      window.clearTimeout(timer);
      video.removeEventListener('ended', settle);
      video.removeEventListener('canplaythrough', reveal);
      video.pause();
      video.removeAttribute('src');
      // Without this the browser keeps streaming the source it no longer has.
      video.load();
      setVideoReady(false);
    };

    /*
      Re-checked on every change, not just at mount: a tablet turned from
      landscape to portrait would otherwise keep playing a 2.36:1 clip inside a
      portrait frame, which crops it to a narrow strip of its own middle.
    */
    const sync = () => (query.matches ? start() : stop());
    if (query.matches) start();
    query.addEventListener('change', sync);

    return () => {
      query.removeEventListener('change', sync);
      stop();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        {/*
          Art direction, not a resolution switch, so this is a `picture` rather
          than a `next/image`: the two files are different crops of the scene and
          only one of them may ever be fetched.
        */}
        <picture>
          <source media="(min-width: 1024px)" srcSet="/pics/hero-wide.webp" />
          <img
            src="/pics/hero-tall.webp"
            alt="warm cozy coffee shop interior"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>

        {/*
          Its first frame is exactly the still underneath, so it can fade in over
          the top without anything appearing to change.
        */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-linear-to-r from-primary/90 via-primary/40 to-transparent" />
      </div>

      {/* `mt-16` clears the fixed header the backdrop now runs behind. */}
      <div className="relative mt-16 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-start pt-[30%] sm:pt-[25%] md:pt-[20%] lg:pt-[20%]">
        <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl space-y-4 sm:space-y-6 motion-slide-up">
          {/*
            No `font-bold`: display weight is a system decision set in tokens.css,
            and the utility has done nothing here since the display faces landed.
          */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink-on-media leading-tight drop-shadow-lg break-keep">
            {t.rich('title', { mobileBr: () => <br className="block" /> })}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-ink-on-media leading-relaxed drop-shadow-sm break-keep max-w-2xl lg:max-w-4xl">
            {t.rich('subtitle', {
              mobileBr: () => <br className="block sm:hidden" />,
              mediumBr: () => <br className="block xl:hidden" />,
            })}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`/${locale}/discover/explore-map`}
              className="px-6 py-3 rounded-full border-2 border-ink-on-media text-ink-on-media bg-white/5 hover:bg-primary hover:text-primaryText transition-all min-h-[48px] flex items-center justify-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            >
              {t('cta_secondary')}
            </a>
            <a
              href={isLoggedIn ? `/${locale}/discover/dropbean` : `/${locale}/register`}
              className="px-8 py-4 rounded-full bg-background text-text hover:bg-primary hover:text-primaryText border-2 border-transparent transition-all transform hover:translate-y-[-2px] shadow-[0_15px_40px_rgba(0,0,0,0.25)] min-h-[56px] flex items-center justify-center text-center font-semibold"
            >
              {isLoggedIn ? t('cta_primary_logged_in') : t('cta_primary')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
