'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink extends FooterLink {
  icon: ReactNode;
}

interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  socialLinks?: SocialLink[];
  navLinks?: FooterLink[];
  brandIcon?: ReactNode;
  copyrightText?: string;
  className?: string;
}

export function Footer({
  brandName = 'Slotly',
  brandDescription = 'Buat waktu untuk hal yang kamu suka.',
  socialLinks = [],
  navLinks = [],
  brandIcon,
  copyrightText = 'Hak cipta dilindungi.',
  className,
}: FooterProps) {
  return (
    <section className={cn('relative mt-0 w-full overflow-hidden', className)}>
      <footer className="relative mt-20 border-t border-border bg-background">
        <div className="relative mx-auto flex min-h-[30rem] max-w-7xl flex-col justify-between p-4 py-10 sm:min-h-[35rem] md:min-h-[40rem]">
          <div className="mb-12 flex w-full flex-col sm:mb-20 md:mb-0">
            <div className="flex w-full flex-col items-center">
              <div className="flex flex-1 flex-col items-center space-y-2">
                <span className="text-3xl font-bold tracking-[-0.04em] text-foreground">
                  {brandName}<span className="text-primary">.</span>
                </span>
                <p className="w-full max-w-sm px-4 text-center font-semibold text-muted-foreground sm:w-96 sm:px-0">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="mb-8 mt-3 flex gap-4">
                  {socialLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="block size-6 duration-300 hover:scale-110">
                        {link.icon}
                      </span>
                      <span className="sr-only">{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <nav
                  className="flex max-w-full flex-wrap justify-center gap-x-6 gap-y-3 px-4 text-sm font-medium text-muted-foreground"
                  aria-label="Navigasi footer"
                >
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      className="duration-300 hover:text-foreground"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center justify-center gap-2 px-4 md:mt-24 md:flex-row md:justify-between md:px-0">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} {brandName}. {copyrightText}
            </p>
            <p className="text-center text-sm text-muted-foreground md:text-right">
              Ada waktu? Ada Slotly.
            </p>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-40 left-1/2 max-w-[95vw] -translate-x-1/2 select-none bg-gradient-to-b from-foreground/20 via-foreground/10 to-transparent bg-clip-text px-4 text-center font-extrabold leading-none tracking-tighter text-transparent md:bottom-32"
          style={{ fontSize: 'clamp(3rem, 12vw, 10rem)' }}
          aria-hidden="true"
        >
          {brandName.toUpperCase()}
        </div>

        <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-3xl border-2 border-border bg-background/60 p-3 shadow-[0_0_28px_rgba(31,62,46,0.16)] backdrop-blur-sm duration-300 hover:border-primary md:bottom-20">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#1f3e2e] shadow-lg sm:size-16 md:size-24">
            {brandIcon || (
              <CalendarDays className="size-8 text-white drop-shadow-lg sm:size-10 md:size-14" />
            )}
          </div>
        </div>

        <div className="absolute bottom-32 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent backdrop-blur-sm" />
        <div className="absolute bottom-28 h-24 w-full bg-gradient-to-t from-background via-background/80 to-background/40 blur-[1em]" />
      </footer>
    </section>
  );
}
