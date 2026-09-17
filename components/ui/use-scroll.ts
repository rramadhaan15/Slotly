'use client';

import * as React from 'react';

export function useScroll(threshold = 10) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const releaseThreshold = Math.max(1, Math.floor(threshold / 4));
    let animationFrame = 0;

    const updateScrolled = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        setScrolled((current) =>
          current
            ? window.scrollY > releaseThreshold
            : window.scrollY > threshold,
        );
      });
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', updateScrolled);
    };
  }, [threshold]);

  return scrolled;
}
