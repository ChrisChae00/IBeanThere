'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

type AccordionMessages = {
  autoFillTitle: string;
  autoFillDesc: string;
  verifiedTitle: string;
  verifiedDesc: string;
  photosTitle: string;
  photosDesc: string;
};

type CafeRegisterClientProps = {
  messages: {
    title: string;
    subtitle: string;
    cta: string;
    accordion: AccordionMessages;
  };
  locale: string;
};

function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let rafId: number;
    let globe: ReturnType<typeof createGlobe> | undefined;

    if (canvasRef.current) {
      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: 600 * 2,
        height: 600 * 2,
        phi: 0,
        theta: 0.3,
        dark: 0,
        diffuse: 1.8,
        mapSamples: 14000,
        mapBrightness: 5,
        baseColor: [0.96, 0.94, 0.91],
        markerColor: [0.55, 0.35, 0.23],
        glowColor: [0.91, 0.84, 0.75],
        markers: [],
      });

      const animate = () => {
        phi += 0.003;
        globe?.update({ phi });
        rafId = requestAnimationFrame(animate);
      };
      rafId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(rafId);
      globe?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[460px] lg:h-[460px]"
      style={{ maxWidth: '100%', aspectRatio: '1' }}
    />
  );
}

const ACCORDION_ITEMS = [
  { value: 'auto-fill', titleKey: 'autoFillTitle', descKey: 'autoFillDesc' },
  { value: 'verified', titleKey: 'verifiedTitle', descKey: 'verifiedDesc' },
  { value: 'photos', titleKey: 'photosTitle', descKey: 'photosDesc' },
] as const;

export default function CafeRegisterClient({ messages, locale }: CafeRegisterClientProps) {
  const acc = messages.accordion;

  const accordionData: { value: string; title: string; desc: string }[] = [
    { value: 'auto-fill', title: acc.autoFillTitle, desc: acc.autoFillDesc },
    { value: 'verified', title: acc.verifiedTitle, desc: acc.verifiedDesc },
    { value: 'photos', title: acc.photosTitle, desc: acc.photosDesc },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Desktop: 2-column. Mobile: single column with globe between text and accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Left column: text + accordion + CTA */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-primaryText)] mb-4 break-keep leading-tight">
              {messages.title}
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-background)] break-keep leading-relaxed">
              {messages.subtitle}
            </p>
          </div>

          {/* Globe — mobile only (between text and accordion) */}
          <div className="flex justify-center lg:hidden">
            <GlobeCanvas />
          </div>

          {/* Accordion */}
          <Accordion.Root
            type="single"
            defaultValue="auto-fill"
            collapsible
            className="w-full rounded-xl overflow-hidden border border-[var(--color-primaryText)]/20"
          >
            {accordionData.map((item, idx) => (
              <Accordion.Item
                key={item.value}
                value={item.value}
                className={idx < accordionData.length - 1 ? 'border-b border-[var(--color-primaryText)]/20' : ''}
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between px-5 py-4 text-left text-sm sm:text-base font-semibold text-[var(--color-primaryText)] hover:bg-[var(--color-primaryText)]/5 transition-colors duration-200 [&[data-state=open]>svg]:rotate-180">
                    {item.title}
                    <ChevronDown
                      className="h-4 w-4 flex-shrink-0 text-[var(--color-primaryText)]/60 transition-transform duration-300 ml-3"
                      aria-hidden="true"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-[accordionDown_200ms_ease-out] data-[state=closed]:animate-[accordionUp_200ms_ease-out]">
                  <p className="px-5 pb-4 pt-1 text-sm sm:text-base text-[var(--color-background)] leading-relaxed">
                    {item.desc}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>

          {/* CTA */}
          <a
            href={`/${locale}/discover/register-cafe`}
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-semibold rounded-full bg-[var(--color-background)] text-[var(--color-text)] hover:bg-[var(--color-primaryText)] transition-all hover:scale-105 shadow-[0_15px_40px_rgba(0,0,0,0.25)] min-h-[56px]"
          >
            {messages.cta}
          </a>
        </div>

        {/* Right column: globe — desktop only */}
        <div className="hidden lg:flex justify-center lg:justify-end">
          <GlobeCanvas />
        </div>
      </div>
    </div>
  );
}
