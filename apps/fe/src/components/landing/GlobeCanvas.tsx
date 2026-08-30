'use client';

/*
  The rotating globe.

  cobe draws into a canvas and takes plain RGB triples rather than CSS colours,
  so nothing here can read the token layer -- the caller passes a theme and the
  defaults are the values the shipped registration section used before this was
  split out of it.
*/

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

/* Colours and camera. Every field falls back to the original section's value. */
export type GlobeTheme = {
  dark?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  /**
   * Latitude the camera looks at, in radians. `0.3` is the shipped value and
   * tips the globe far enough north to spend a lot of the sphere on the Arctic;
   * `0` centres the equator, where the land is.
   */
  theta?: number;
  /**
   * Axial tilt, in degrees, applied to the canvas rather than to the scene --
   * cobe has no roll axis, and rotating the projection of a sphere is exactly
   * what a tilted axis of rotation looks like. The glow is a circle, so it is
   * unaffected.
   */
  tiltDeg?: number;
};

export function GlobeCanvas({ theme }: { theme?: GlobeTheme } = {}) {
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
        theta: theme?.theta ?? 0.3,
        dark: theme?.dark ?? 0,
        diffuse: 1.8,
        mapSamples: 14000,
        mapBrightness: 5,
        baseColor: theme?.baseColor ?? [0.96, 0.94, 0.91],
        markerColor: theme?.markerColor ?? [0.55, 0.35, 0.23],
        glowColor: theme?.glowColor ?? [0.91, 0.84, 0.75],
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
  }, [theme]);

  return (
    <div className="relative mx-auto w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[460px] lg:h-[460px] flex justify-center items-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          maxWidth: '100%',
          aspectRatio: '1',
          transform: theme?.tiltDeg ? `rotate(${theme.tiltDeg}deg)` : undefined,
        }}
      />
    </div>
  );
}
