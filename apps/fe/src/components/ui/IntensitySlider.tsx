'use client';

import { useState, useRef, useEffect } from 'react';
import CoffeeBean from './CoffeeBean';

interface IntensitySliderProps {
  value: number | undefined;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export default function IntensitySlider({
  value,
  onChange,
  label,
  min = 0,
  max = 10,
  step = 1,
  className = ''
}: IntensitySliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const currentValue = value ?? undefined;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  const handleMove = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = Math.round((percentage / 100) * (max - min) + min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    onChange(clampedValue);
  };

  const percentage = currentValue !== undefined ? ((currentValue - min) / (max - min)) * 100 : 0;

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, min, max, step, onChange]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
        {currentValue !== undefined && (
          <div className="px-2 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]">
            <span className="text-sm font-semibold text-[var(--color-primary)]">
              {currentValue}
            </span>
          </div>
        )}
        {currentValue === undefined && (
          <span className="text-xs text-[var(--color-surfaceTextSecondary)]">
            -
          </span>
        )}
      </div>
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-6 cursor-pointer"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleClick}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentValue}
          aria-label={label}
          tabIndex={0}
          onKeyDown={(e) => {
            if (currentValue === undefined) {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                onChange(min);
              }
              return;
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault();
              onChange(Math.max(min, currentValue - step));
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault();
              onChange(Math.min(max, currentValue + step));
            }
          }}
        >
          {/* Track */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[var(--color-border)] rounded-full transform -translate-y-1/2 z-0" />
          
          {/* Step markers (dots) */}
          {Array.from({ length: max - min + 1 }, (_, i) => {
            const stepValue = min + i;
            const stepPercentage = ((stepValue - min) / (max - min)) * 100;
            return (
              <div
                key={stepValue}
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-surface)] z-20"
                style={{ left: `${stepPercentage}%` }}
              />
            );
          })}
          
          {/* Filled track */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-[var(--color-primary)] rounded-full transform -translate-y-1/2 transition-all duration-150 z-10"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb with CoffeeBean */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-150 cursor-grab active:cursor-grabbing z-30"
            style={{ left: `${percentage}%` }}
          >
            <div className="relative flex items-center justify-center">
              {/* Circular background to hide track behind thumb */}
              <div className="absolute w-6 h-6 rounded-full bg-[var(--color-cardBackground)] border border-[var(--color-border)] shadow-sm z-0" />
              <div className="relative z-10">
                <CoffeeBean size="sm" className="text-[var(--color-primary)]" />
              </div>
              {isDragging && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs font-medium text-[var(--color-text)] whitespace-nowrap z-40 shadow-md">
                  {currentValue}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Value labels */}
        <div className="relative mt-1.5 h-4">
          <span 
            className="absolute text-xs text-[var(--color-surfaceTextSecondary)] transform -translate-x-1/2"
            style={{ left: '20%' }}
          >
            2
          </span>
          <span 
            className="absolute text-xs text-[var(--color-surfaceTextSecondary)] transform -translate-x-1/2"
            style={{ left: '50%' }}
          >
            5
          </span>
          <span 
            className="absolute text-xs text-[var(--color-surfaceTextSecondary)] transform -translate-x-1/2"
            style={{ left: '80%' }}
          >
            8
          </span>
        </div>
      </div>
    </div>
  );
}

