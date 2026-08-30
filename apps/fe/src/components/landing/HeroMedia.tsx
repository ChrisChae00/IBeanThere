'use client';

/*
  The hero's moving backdrop, on its own: the still, the gust video over it, and
  the scrim that lets light ink sit on top.

  Split out of `HeroBackdrop` so a second hero composition can stand on the same
  media without copying the gust cycle. `HeroBackdrop` renders it and lays its
  own copy over it; nothing about the shipped hero changed in the move.

  Fills its positioned ancestor -- give the parent `relative` and a height.
*/

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

export default function HeroMedia() {
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

  return (
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

      {/*
        The tinted wash reads `--scrim-media`, not `--brand`. Brand is a
        foreground colour that a dark theme has to make light, and Dark Roast's
        is `#d4c7b8` - as a wash that whitened the video and left the headline
        fighting its own backdrop. The scrim slot stays dark in all four themes
        and still carries each one's hue.
      */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-linear-to-r from-scrim-media/30 via-scrim-media/30 to-transparent" />
    </div>
  );
}
