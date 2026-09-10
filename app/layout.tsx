import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Slotly — Waktu luang, jadi pengalaman',
  description:
    'Cari lapangan, salon, dan studio pilihan. Cek jadwal dan reservasi tempat favoritmu dengan mudah.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
