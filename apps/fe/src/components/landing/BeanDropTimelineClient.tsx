'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import {
  SeedIcon,
  SproutIcon,
  GrowingIcon,
  TreeIcon,
  HarvestIcon,
} from './GrowthJourneyIcons';
import Badge from '@/shared/ui/Badge';

type GrowthStage = 'seed' | 'sprout' | 'growing' | 'tree' | 'harvest';

type StageMessages = {
  title: string;
  badge: string;
  description: string;
  highlights: string[];
};

type BeanDropTimelineMessages = {
  title: string;
  subtitle: string;
  seed: StageMessages;
  sprout: StageMessages;
  growing: StageMessages;
  tree: StageMessages;
  harvest: StageMessages;
};

const STAGE_ICONS: Record<GrowthStage, React.ReactNode> = {
  seed: <SeedIcon className="w-10 h-10" />,
  sprout: <SproutIcon className="w-10 h-10" />,
  growing: <GrowingIcon className="w-10 h-10" />,
  tree: <TreeIcon className="w-10 h-10" />,
  harvest: <HarvestIcon className="w-10 h-10" />,
};

const STAGES: GrowthStage[] = ['seed', 'sprout', 'growing', 'tree', 'harvest'];

export default function BeanDropTimelineClient({
  messages,
}: {
  messages: BeanDropTimelineMessages;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 10%', 'end 50%'],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full" ref={containerRef}>
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10 pt-10 pb-0">
        <h2 className="text-3xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
          {messages.title}
        </h2>
        <p className="text-[var(--color-secondary)] text-base md:text-lg max-w-2xl">
          {messages.subtitle}
        </p>
      </div>

      {/* Timeline entries */}
      <div ref={ref} className="relative max-w-7xl mx-auto pb-5 pt-1 px-4 md:px-8 lg:px-10">
        {STAGES.map((stage) => {
          const data = messages[stage];
          return (
            <div key={stage} className="flex justify-start pt-10 md:pt-36 md:gap-10">
              {/* Left column: sticky icon + title */}
              <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                <div className="h-12 absolute left-2 md:left-3 w-12 rounded-full bg-[var(--color-background)] border-2 border-[var(--color-border)] flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                  {STAGE_ICONS[stage]}
                </div>
                <h3 className="hidden md:block text-xl md:pl-20 md:text-3xl font-bold text-[var(--color-text)] opacity-85">
                  {data.title}
                </h3>
              </div>

              {/* Right column: animated card */}
              <div className="relative pl-20 pr-4 md:pl-4 w-full">
                <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-[var(--color-text)]">
                  {data.title}
                </h3>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="mb-4">
                    <Badge variant="info" size="sm">
                      {data.badge}
                    </Badge>
                  </div>
                  <p className="text-[var(--color-text)] font-medium text-base md:text-lg mb-6 leading-relaxed">
                    {data.description}
                  </p>
                  <div className="border-t border-[var(--color-border)] pt-4 flex flex-wrap gap-2 justify-center">
                    {data.highlights.map((highlight, i) => (
                      <span
                        key={i}
                        className="text-xs md:text-sm bg-[var(--color-primary)]/5 text-[var(--color-text)] px-3 py-1.5 rounded-lg"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          );
        })}

        {/* Animated vertical line */}
        <div
          style={{ height: `${height}px` }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-[var(--color-border)] to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-[var(--color-primary)] via-[var(--color-primary)]/80 to-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
