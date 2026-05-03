import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type DynamicWaveCanvasProps = {
  className?: string;
  /** Multiplier for wave brightness / saturation (typ. 0.5–1.2). */
  intensity?: number;
  /**
   * Logical pixel block size; higher = fewer canvas pixels and lower CPU cost.
   * Auth hero: 2–3. Busy /app shell: 4 recommended.
   */
  resolutionScale?: number;
  /** Wave stack depth; 2 is enough when `resolutionScale` is high. */
  waveIterations?: number;
};

/**
 * Full-viewport procedural wave (CPU canvas). Prefer higher `resolutionScale` on dashboard routes.
 */
export const DynamicWaveCanvas = ({
  className,
  intensity = 1,
  resolutionScale = 2,
  waveIterations = 4,
}: DynamicWaveCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = Math.max(2, resolutionScale);

    let width = 0;
    let height = 0;
    let imageData: ImageData;
    let data: Uint8ClampedArray;
    let animationId = 0;
    let frameIndex = 0;

    const iterations = Math.min(6, Math.max(2, waveIterations));

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      width = Math.floor(canvas.width / scale);
      height = Math.floor(canvas.height / scale);
      imageData = ctx.createImageData(width, height);
      data = imageData.data;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const startTime = Date.now();

    const SIN_TABLE = new Float32Array(1024);
    const COS_TABLE = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const angle = (i / 1024) * Math.PI * 2;
      SIN_TABLE[i] = Math.sin(angle);
      COS_TABLE[i] = Math.cos(angle);
    }

    const fastSin = (x: number) => {
      const index = Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023;
      return SIN_TABLE[index] ?? 0;
    };

    const fastCos = (x: number) => {
      const index = Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023;
      return COS_TABLE[index] ?? 0;
    };

    const render = () => {
      const time = (Date.now() - startTime) * 0.001;

      if (!width || !height) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Skip every other frame when heavily downscaled — still reads as motion, halves CPU.
      const skipFrame = scale >= 4;
      if (skipFrame) {
        frameIndex += 1;
        if (frameIndex % 2 === 0) {
          animationId = requestAnimationFrame(render);
          return;
        }
      }

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const u_x = (2 * x - width) / height;
          const u_y = (2 * y - height) / height;

          let a = 0;
          let d = 0;

          for (let i = 0; i < iterations; i++) {
            a += fastCos(i - d + time * 0.5 - a * u_x);
            d += fastSin(i * u_y + a);
          }

          const wave = (fastSin(a) + fastCos(d)) * 0.5;
          const waveIntensity = 0.3 + 0.4 * wave;
          const baseVal = 0.1 + 0.15 * fastCos(u_x + u_y + time * 0.3);
          const blueAccent = 0.2 * fastSin(a * 1.5 + time * 0.2);
          const purpleAccent = 0.15 * fastCos(d * 2 + time * 0.1);

          const r =
            Math.max(0, Math.min(1, baseVal + purpleAccent * 0.8)) * waveIntensity * intensity;
          const g =
            Math.max(0, Math.min(1, baseVal + blueAccent * 0.6)) * waveIntensity * intensity;
          const b =
            Math.max(0, Math.min(1, baseVal + blueAccent * 1.2 + purpleAccent * 0.4)) *
            waveIntensity *
            intensity;

          const idx = (y * width + x) * 4;
          data[idx] = r * 255;
          data[idx + 1] = g * 255;
          data[idx + 2] = b * 255;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      if (scale > 1) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [intensity, resolutionScale, waveIterations]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('absolute inset-0 size-full', className)}
    />
  );
};
