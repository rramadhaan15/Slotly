import Image from 'next/image';
import { cn } from '@/lib/utils';
import styles from './slotly-logo.module.css';

type SlotlyLogoProps = {
  className?: string;
  framed?: boolean;
  priority?: boolean;
};

export function SlotlyLogo({
  className,
  framed = false,
  priority = false,
}: SlotlyLogoProps) {
  return (
    <span className={cn(styles.logo, framed && styles.framed, className)}>
      <Image
        className={styles.image}
        src={
          framed
            ? '/images/slotly-logo-transparent.png'
            : '/images/slotly-logo.png'
        }
        alt="Slotly"
        width={framed ? 1922 : 1920}
        height={framed ? 818 : 850}
        priority={priority}
      />
    </span>
  );
}
