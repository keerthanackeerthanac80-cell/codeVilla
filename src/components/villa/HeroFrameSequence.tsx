'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface HeroFrameSequenceProps {
  /** 0 to 1 — controls which frame to show */
  progress: number;
  /** Total number of frames available */
  totalFrames?: number;
  /** Path pattern for frames */
  framePath?: string;
  className?: string;
}

const TOTAL_FRAMES = 240;
const FRAME_PATH = '/Hero-frames/frame_';

function getFrameSrc(index: number): string {
  const padded = String(index).padStart(6, '0');
  return `${FRAME_PATH}${padded}.jpg`;
}

export default function HeroFrameSequence({
  progress,
  totalFrames = TOTAL_FRAMES,
  className = '',
}: HeroFrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [loaded, setLoaded] = useState(false);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Preload all frames
  useEffect(() => {
    let mounted = true;
    const images: (HTMLImageElement | null)[] = new Array(totalFrames).fill(null);
    let loadedCount = 0;

    // Load first frame immediately for instant display
    const firstImg = new Image();
    firstImg.src = getFrameSrc(0);
    firstImg.onload = () => {
      if (!mounted) return;
      images[0] = firstImg;
      imagesRef.current = images;
      // Draw first frame immediately
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = firstImg.naturalWidth;
          canvas.height = firstImg.naturalHeight;
          ctx.drawImage(firstImg, 0, 0);
        }
      }
    };

    // Load rest progressively
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = () => {
        if (!mounted) return;
        images[i] = img;
        loadedCount++;
        if (loadedCount >= totalFrames * 0.3) {
          setLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
      };
    }

    imagesRef.current = images;

    return () => {
      mounted = false;
    };
  }, [totalFrames]);

  // Render the current frame based on progress
  const renderFrame = useCallback(
    (targetFrame: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const frame = Math.max(0, Math.min(totalFrames - 1, Math.round(targetFrame)));
      if (frame === currentFrameRef.current && loaded) return;

      const img = imagesRef.current[frame];
      if (img) {
        if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        currentFrameRef.current = frame;
      } else {
        // Find nearest loaded frame
        for (let offset = 1; offset < 10; offset++) {
          const nearby = imagesRef.current[frame - offset] || imagesRef.current[frame + offset];
          if (nearby) {
            if (canvas.width !== nearby.naturalWidth || canvas.height !== nearby.naturalHeight) {
              canvas.width = nearby.naturalWidth;
              canvas.height = nearby.naturalHeight;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(nearby, 0, 0);
            break;
          }
        }
      }
    },
    [totalFrames, loaded]
  );

  // Update frame on progress change
  useEffect(() => {
    const targetFrame = progress * (totalFrames - 1);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      renderFrame(targetFrame);
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [progress, renderFrame, totalFrames]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full object-cover ${className}`}
      style={{
        imageRendering: 'auto',
      }}
      aria-hidden="true"
    />
  );
}
