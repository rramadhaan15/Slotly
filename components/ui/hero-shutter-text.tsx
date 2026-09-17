'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import styles from './hero-shutter-text.module.css';

interface HeroShutterTextProps {
  text?: string;
  className?: string;
}

export default function HeroShutterText({
  text = 'Waktu luang, jadi\npengalaman.',
  className,
}: HeroShutterTextProps) {
  const reduceMotion = useReducedMotion();
  let characterIndex = 0;

  return (
    <span className={cn(styles.root, className)} aria-hidden="true">
      {text.split('\n').map((line, lineIndex) => (
        <span
          className={cn(styles.line, lineIndex > 0 && styles.accentLine)}
          key={`${line}-${lineIndex}`}
        >
          {line.split('').map((character) => {
            const index = characterIndex++;
            const renderedCharacter = character === ' ' ? '\u00a0' : character;

            return (
              <span className={styles.character} key={`${character}-${index}`}>
                <motion.span
                  className={styles.mainCharacter}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, filter: 'blur(10px)' }
                  }
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { delay: index * 0.04 + 0.3, duration: 0.8 }
                  }
                >
                  {renderedCharacter}
                </motion.span>

                {!reduceMotion && (
                  <>
                    <motion.span
                      className={cn(styles.slice, styles.topSlice)}
                      initial={{ x: '-100%', opacity: 0 }}
                      animate={{ x: '100%', opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.04,
                        ease: 'easeInOut',
                      }}
                    >
                      {renderedCharacter}
                    </motion.span>

                    <motion.span
                      className={cn(styles.slice, styles.middleSlice)}
                      initial={{ x: '100%', opacity: 0 }}
                      animate={{ x: '-100%', opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.04 + 0.1,
                        ease: 'easeInOut',
                      }}
                    >
                      {renderedCharacter}
                    </motion.span>

                    <motion.span
                      className={cn(styles.slice, styles.bottomSlice)}
                      initial={{ x: '-100%', opacity: 0 }}
                      animate={{ x: '100%', opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.04 + 0.2,
                        ease: 'easeInOut',
                      }}
                    >
                      {renderedCharacter}
                    </motion.span>
                  </>
                )}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
