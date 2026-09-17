'use client';

import * as React from 'react';

export function useScroll(threshold = 10) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > threshold);

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });

    return () => window.removeEventListener('scroll', updateScrolled);
  }, [threshold]);

  return scrolled;
}
