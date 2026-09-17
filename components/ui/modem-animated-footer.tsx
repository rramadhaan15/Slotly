'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlotlyLogo } from '@/components/slotly-logo';

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
      <footer className="relative mt-12 border-t border-border bg-background">
        <div className="relative mx-auto flex min-h-[26rem] max-w-7xl flex-col justify-between p-4 py-8 sm:min-h-[28rem] sm:py-10">
          <div className="relative z-20 flex w-full flex-col">
            <div className="flex w-full flex-col items-center">
              <div className="flex flex-1 flex-col items-center space-y-2">
                <SlotlyLogo className="w-32 sm:w-36" />
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
                  className="mt-3 flex max-w-full flex-wrap justify-center gap-2 rounded-2xl border border-[#dce8df] bg-[#f4f8f3]/90 p-1.5 shadow-[0_8px_24px_rgba(31,62,46,0.06)]"
                  aria-label="Navigasi footer"
                >
                  {navLinks.map((link) => {
                    const isSignIn = link.href === '/signin';

                    return (
                      <Link
                        key={link.label}
                        className={cn(
                          'group inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27794c] focus-visible:ring-offset-2',
                          isSignIn
                            ? 'border-[#27794c] bg-[#27794c] !text-white shadow-[0_6px_16px_rgba(39,121,76,0.2)] hover:-translate-y-0.5 hover:bg-[#206b41] hover:shadow-[0_9px_20px_rgba(39,121,76,0.25)]'
                            : 'border-[#d7e3da] bg-white text-[#40594c] shadow-sm hover:-translate-y-0.5 hover:border-[#9dbba6] hover:bg-[#fafff9] hover:text-[#206b41] hover:shadow-md',
                        )}
                        href={link.href}
                      >
                        {link.label}
                        {isSignIn ? (
                          <LogIn aria-hidden="true" className="size-4" />
                        ) : (
                          <ArrowUpRight
                            aria-hidden="true"
                            className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>
          </div>

          <div className="relative z-20 mt-auto flex flex-col items-center justify-center gap-2 px-4 md:flex-row md:justify-between md:px-0">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} {brandName}. {copyrightText}
            </p>
            <p className="text-center text-sm text-muted-foreground md:text-right">
              Ada waktu? Ada Slotly.
            </p>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-32 left-1/2 max-w-[95vw] -translate-x-1/2 select-none bg-gradient-to-b from-foreground/20 via-foreground/10 to-transparent bg-clip-text px-4 text-center font-extrabold leading-none tracking-tighter text-transparent"
          style={{ fontSize: 'clamp(3rem, 12vw, 10rem)' }}
          aria-hidden="true"
        >
          {brandName.toUpperCase()}
        </div>

        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-3xl border-2 border-border bg-background/70 p-3 shadow-[0_0_28px_rgba(31,62,46,0.16)] backdrop-blur-sm duration-300 hover:border-primary">
          <div className="flex h-12 w-28 items-center justify-center overflow-hidden rounded-2xl bg-[#fbf9f2] shadow-lg sm:h-16 sm:w-36 md:h-20 md:w-44">
            {brandIcon || <SlotlyLogo className="w-full" />}
          </div>
        </div>

        <div className="absolute bottom-32 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent backdrop-blur-sm" />
        <div className="absolute bottom-28 h-24 w-full bg-gradient-to-t from-background via-background/80 to-background/40 blur-[1em]" />
      </footer>
    </section>
  );
}
