'use client';

/*
  Scroll-driven motion primitives shared by both landing variants.

  Two rules hold everything here together:

  1. Nothing that runs per frame calls `setState`. React renders once and then
     stays out of the way; a `setState` at 60fps on a page this tall is the
     difference between motion and a stutter.
  2. Every entrance resolves to its finished state when motion is off, rather
     than to nothing. A reader who turns motion off should get the page, not an
     empty page.
*/

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Fragment, useEffect, useRef, type ReactNode } from 'react';

/*
  One reveal shape used everywhere, so the whole page enters the same way. The
  distance is small on purpose: a long travel reads as a slideshow, a short one
  reads as the page settling.
*/
const RISE: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0 },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds of delay, for staggering siblings by hand. */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'span';
  /**
   * `view` (default) waits for the element to scroll into view, and needs JS.
   * `load` runs once on the first paint, in CSS -- use it for anything above
   * the fold, where a JS-parked hidden state would be a blank page until the
   * motion bundle hydrates.
   */
  trigger?: 'view' | 'load';
};

/** Fades and lifts its children, on view by default or on load. */
export function Reveal({ children, className, delay = 0, as = 'div', trigger = 'view' }: RevealProps) {
  const reduced = useReducedMotion();

  if (trigger === 'load') {
    const Tag = as;
    return (
      <Tag className={`landing-rise ${className ?? ''}`} style={{ ['--landing-delay' as string]: `${delay}s` }}>
        {children}
      </Tag>
    );
  }

  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={reduced ? 'shown' : 'hidden'}
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={RISE}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}

type RevealWordsProps = {
  text: string;
  className?: string;
  /** Seconds between consecutive words. */
  stagger?: number;
  /**
   * `load` (default) runs on the first paint, in CSS, and is the only safe
   * choice above the fold. `view` holds the first frame until the headline is
   * scrolled to. Neither ever reverses -- the words arrive and stay.
   */
  trigger?: 'load' | 'view';
};

/**
 * Sets a headline word by word, in CSS.
 *
 * Deliberately not a JS animation: a headline is the first thing on the page,
 * and a word parked at `translateY(110%)` inside a clipping row is invisible
 * until hydration. The stylesheet is render-blocking, so this runs on the first
 * paint whether or not the JS ever arrives.
 *
 * The whole string stays in one accessible label; the per-word spans are hidden
 * from the accessibility tree so a screen reader hears a sentence, not a list.
 */
export function RevealWords({ text, className, stagger = 0.055, trigger = 'load' }: RevealWordsProps) {
  const words = text.split(' ');
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (trigger !== 'view') return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.classList.add('is-in');
        // Once only: the words arrive and stay.
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [trigger]);

  return (
    <span ref={ref} className={`${trigger === 'view' ? 'landing-words-view ' : ''}${className ?? ''}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline">
        {words.map((word, index) => (
          /*
            The word space is a sibling of the row, not a child. Inside an
            `overflow: hidden` inline-block a trailing space is trimmed, and the
            headline sets solid.
          */
          <Fragment key={`${word}-${index}`}>
            <span className="landing-word-row">
              <span className="landing-word" style={{ ['--landing-delay' as string]: `${index * stagger}s` }}>
                {word}
              </span>
            </span>
            {index < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
}

type CounterProps = {
  value: number;
  className?: string;
  /** Rendered after the number, inside the same accessible label. */
  suffix?: string;
};

/**
 * Counts up to `value` once, when it first appears. Written straight to the DOM
 * node: a state update per frame here is what makes a page of counters jank.
 */
export function Counter({ value, className, suffix = '' }: CounterProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) {
      node.textContent = `${value.toLocaleString()}${suffix}`;
      return;
    }

    let frame = 0;
    let start = 0;
    const DURATION = 1400;

    const run = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / DURATION, 1);
      // Ease-out cubic: fast at first, then the last few digits settle. A linear
      // count reads as a loading spinner.
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${Math.round(value * eased).toLocaleString()}${suffix}`;
      if (progress < 1) frame = requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        frame = requestAnimationFrame(run);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, suffix, reduced]);

  // The server-rendered text is the final value, so a page that never hydrates
  // still shows the number rather than a zero.
  return (
    <span ref={ref} className={className}>
      {`${value.toLocaleString()}${suffix}`}
    </span>
  );
}
