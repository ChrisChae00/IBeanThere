'use client';

import type { ReactNode } from 'react';
import {
  Tooltip as BaseTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './base/tooltip';

/*
  Wrapper over the shadcn/Base UI tooltip, keeping this repo's
  `content` / `position` / `delay` props.

  The previous implementation showed its bubble on hover state only, so it was
  unreachable by keyboard and invisible to assistive tech. Base UI's trigger responds to
  focus as well as hover and wires aria-describedby.

  The provider is mounted here rather than in the root layout: only these call sites use
  a tooltip, and a wrapper that needs the app shell edited to work is a wrapper that
  breaks call sites.

  MIGRATION: new code should use the compound API from '@/shared/ui/base/tooltip' with a
  single TooltipProvider higher up.
*/

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200
}: TooltipProps) {
  return (
    <TooltipProvider delay={delay}>
      <BaseTooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={position}>{content}</TooltipContent>
      </BaseTooltip>
    </TooltipProvider>
  );
}
