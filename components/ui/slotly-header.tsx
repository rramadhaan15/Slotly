'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlotlyLogo } from '@/components/slotly-logo';
import { Button } from '@/components/ui/button';
import { useScroll } from '@/components/ui/use-scroll';

const links = [
  { label: 'Tempat pilihan', href: '#pilihan' },
  { label: 'Cara kerja', href: '#cara-kerja' },
];

export function SlotlyHeader() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(16);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 h-[78px] w-full">
      <div
        className={cn(
          'mx-auto w-full border-b border-transparent bg-[#fbfcfa]/95 transition-[max-width,transform,border-color,border-radius,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          scrolled &&
            !open &&
            'max-w-[1160px] translate-y-3 rounded-2xl border-[#dce7df] bg-[#fbfcfa]/88 shadow-[0_14px_38px_rgba(23,50,38,0.1)] backdrop-blur-xl',
          open && 'bg-[#fbfcfa]',
        )}
      >
        <nav
          className={cn(
            'mx-auto flex h-[78px] w-full max-w-[1500px] items-center justify-between px-7 transition-[height,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-10',
            scrolled && !open && 'h-16 max-w-none px-4 sm:px-5',
          )}
          aria-label="Navigasi utama"
        >
          <Link
            className="inline-flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27794c] focus-visible:ring-offset-2"
            href="/"
            aria-label="Slotly beranda"
            onClick={closeMenu}
          >
            <SlotlyLogo className="w-28 sm:w-[132px]" priority />
          </Link>

          <div className="hidden items-center md:flex">
            <div className="flex items-center gap-1">
              {links.map((link) => (
                <a
                  key={link.label}
                  className="rounded-lg px-4 py-2 text-[13px] font-semibold text-[#607168] transition-colors hover:bg-[#edf4ee] hover:text-[#206b41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27794c] focus-visible:ring-offset-2"
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <Link
              className="ml-5 rounded-lg px-3 py-2 text-[13px] font-semibold text-[#496156] transition-colors hover:bg-[#edf4ee] hover:text-[#206b41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27794c] focus-visible:ring-offset-2"
              href="/signin"
            >
              Masuk
            </Link>
            <Link
              className="ml-3 inline-flex min-h-11 items-center justify-center gap-2.5 rounded-xl border border-[#27794c] bg-[#27794c] px-5 text-[13px] font-semibold !text-white shadow-[0_9px_24px_rgba(39,121,76,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#206b41] hover:shadow-[0_13px_28px_rgba(39,121,76,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27794c] focus-visible:ring-offset-2"
              href="/signin"
            >
              Jelajahi tempat <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          <div className="md:hidden">
            <Button
              className="size-10 rounded-xl border-[#dce7df] bg-white text-[#284a39] shadow-sm hover:bg-[#edf4ee]"
              size="icon"
              variant="outline"
              onClick={() => setOpen((current) => !current)}
              aria-expanded={open}
              aria-controls="slotly-mobile-menu"
              aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </nav>

        <div
          id="slotly-mobile-menu"
          className={cn(
            'fixed inset-x-0 bottom-0 top-[78px] z-50 overflow-hidden border-t border-[#e1e9e3] bg-[#fbfcfa]/98 backdrop-blur-xl md:hidden',
            open ? 'block' : 'hidden',
          )}
        >
          <div className="flex h-full flex-col justify-between gap-8 p-5">
            <div className="grid gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  className="rounded-xl px-4 py-3 text-base font-semibold text-[#40594c] transition-colors hover:bg-[#edf4ee]"
                  href={link.href}
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="grid gap-3 pb-5">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#cfded3] bg-white px-5 text-sm font-semibold text-[#40594c]"
                href="/signin"
                onClick={closeMenu}
              >
                Masuk
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-[#27794c] bg-[#27794c] px-5 text-sm font-semibold !text-white shadow-[0_10px_24px_rgba(39,121,76,0.2)]"
                href="/signin"
                onClick={closeMenu}
              >
                Jelajahi tempat <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
