'use client';
/* oxlint-disable next/no-html-link-for-pages -- SIWC endpoints require top-level navigation without router prefetch. */
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Bell, CalendarDays, ArrowUpRight } from 'lucide-react';
import { Choice, type Notification } from './shared';
export function InfoDialog({
  info,
  setInfo,
  user,
  notifications,
  areas,
  area,
  onArea,
}: {
  info: string;
  setInfo: (s: string) => void;
  user: { name: string; email: string } | null;
  notifications: Notification[];
  areas: string[];
  area: string;
  onArea: (a: string) => void;
}) {
  return (
    <Dialog open={!!info} onOpenChange={(v) => !v && setInfo('')}>
      <DialogContent className="standard-dialog">
        <DialogTitle>
          {info === 'Masuk'
            ? 'Simpan rencanamu di Slotly'
            : info === 'Akun'
              ? 'Akun saya'
              : info === 'Lokasi'
                ? 'Area yang tersedia'
                : info === 'Bantuan'
                  ? 'Ada yang bisa kami bantu?'
                  : 'Notifikasi'}
        </DialogTitle>
        <DialogDescription>
          {info === 'Notifikasi'
            ? 'Konfirmasi dan perubahan reservasimu.'
            : info === 'Lokasi'
              ? 'Slotly dimulai dari tempat-tempat pilihan di Jakarta Selatan.'
              : info === 'Bantuan'
                ? 'Panduan singkat untuk pengalaman reservasi yang nyaman.'
                : 'Masuk untuk menyimpan favorit dan mengelola reservasi.'}
        </DialogDescription>
        {info === 'Notifikasi' ? (
          notifications.length ? (
            notifications.map((n) => (
              <div className="notification-item" key={n.id}>
                <CalendarDays size={19} />
                <div>
                  <strong>{n.action}</strong>
                  <p>
                    SL-{n.booking_id.slice(0, 8).toUpperCase()} ·{' '}
                    {new Date(n.created_at * 1000).toLocaleString('id-ID', {
                      timeZone: 'Asia/Jakarta',
                    })}{' '}
                    WIB
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="panel-empty">
              <Bell size={30} />
              <p>
                Belum ada notifikasi. Konfirmasi booking akan muncul di sini.
              </p>
            </div>
          )
        ) : info === 'Bantuan' ? (
          <div className="help-content">
            <h3>Bagaimana cara booking?</h3>
            <p>
              Pilih tempat, tanggal, unit, dan jam. Slot ditahan 10 menit selama
              kamu mengisi detail reservasi.
            </p>
            <h3>Apakah ada pembayaran sungguhan?</h3>
            <p>
              Belum. Slotly saat ini dalam mode demo. DP dan pelunasan merupakan
              simulasi.
            </p>
            <h3>Bisakah saya membatalkan?</h3>
            <p>
              Bisa, melalui Booking Saya minimal 24 jam sebelum jadwal. Untuk
              mengubah jadwal, batalkan lalu pesan slot baru.
            </p>
            <h3>Di mana pengingat saya?</h3>
            <p>
              Konfirmasi tersedia di aplikasi. Pengiriman email dan WhatsApp
              belum diaktifkan.
            </p>
          </div>
        ) : info === 'Lokasi' ? (
          <>
            <Choice
              label="Pilih area"
              value={area}
              onChange={onArea}
              options={[
                { value: 'all', label: 'Seluruh Jakarta Selatan' },
                ...areas.map((a) => ({ value: a, label: a })),
              ]}
            />
            <p className="fine-print">
              Area lain tersedia setelah mitra baru terverifikasi.
            </p>
          </>
        ) : user ? (
          <>
            <div className="account-summary">
              <span className="avatar">{user.name[0]?.toUpperCase()}</span>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
            <p className="fine-print">
              Masuk menggunakan akun ChatGPT. Pendaftaran email/OTP mandiri
              belum diaktifkan.
            </p>
            <a
              className="outline"
              href="/signout-with-chatgpt?return_to=%2F"
              target="_top"
            >
              Keluar dari akun
            </a>
          </>
        ) : (
          <a
            className="primary"
            href="/signin-with-chatgpt?return_to=%2F"
            target="_top"
          >
            Masuk dengan ChatGPT <ArrowUpRight size={17} />
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}
