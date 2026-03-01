'use client';

import { useEffect, useRef } from 'react';

interface ScrollingImageGridProps {
  images: string[];
  className?: string;
}

export function ScrollingImageGrid({ images, className = '' }: ScrollingImageGridProps) {
  // Split images into 3 columns (round-robin)
  const columns: string[][] = [[], [], []];
  images.forEach((img, i) => {
    columns[i % 3].push(img);
  });

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Rotated wrapper for diagonal tilt effect */}
      <div
        className="absolute flex gap-4 justify-center"
        style={{
          transform: 'rotate(-15deg)',
          top: '-60%',
          left: '-5%',
          right: '-15%',
          bottom: '-60%',
        }}
      >
        {columns.map((colImages, colIndex) => (
          <ScrollColumn
            key={colIndex}
            images={colImages}
            direction={colIndex % 2 === 0 ? 'up' : 'down'}
            speed={25 + colIndex * 3}
          />
        ))}
      </div>
    </div>
  );
}

interface ScrollColumnProps {
  images: string[];
  direction: 'up' | 'down';
  speed: number;
}

function ScrollColumn({ images, direction, speed }: ScrollColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;

    // Create the animation
    const keyframes = direction === 'up'
      ? [
          { transform: 'translateY(0)' },
          { transform: 'translateY(-50%)' },
        ]
      : [
          { transform: 'translateY(-50%)' },
          { transform: 'translateY(0)' },
        ];

    const animation = column.animate(keyframes, {
      duration: speed * 1000,
      iterations: Infinity,
      easing: 'linear',
    });

    return () => animation.cancel();
  }, [direction, speed]);

  // Duplicate images for seamless loop
  const allImages = [...images, ...images];

  return (
    <div className="flex-shrink-0 w-[200px]">
      <div ref={columnRef} className="flex flex-col gap-3">
        {allImages.map((src, i) => (
          <div
            key={i}
            className="w-[200px] h-[200px] rounded-2xl overflow-hidden shadow-lg flex-shrink-0"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
