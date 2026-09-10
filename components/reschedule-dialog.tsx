'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { api, Choice, type Booking } from './shared';
import { today, dateLabel } from '@/lib/catalog';
export function RescheduleDialog({
  booking,
  onClose,
  onSaved,
}: {
  booking: Booking;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(booking.date);
  const [hour, setHour] = useState(String(booking.hour));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api({
        action: 'reschedule',
        bookingId: booking.id,
        date,
        hour: Number(hour),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="standard-dialog">
        <DialogTitle>Atur ulang waktumu</DialogTitle>
        <DialogDescription>
          Jadwal saat ini: {dateLabel(booking.date)}, {booking.hour}.00 WIB ·{' '}
          {booking.unit}.
        </DialogDescription>
        <form onSubmit={submit}>
          <div className="booking-fields">
            <label>
              Tanggal baru
              <input
                aria-label="Tanggal baru"
                type="date"
                min={today()}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Waktu mulai
              <Choice
                label="Waktu baru"
                value={hour}
                onChange={setHour}
                options={Array.from({ length: 14 }, (_, i) => ({
                  value: String(i + 8),
                  label: `${i + 8}.00 WIB`,
                }))}
              />
            </label>
          </div>
          <p className="fine-print">
            Ketersediaan diperiksa saat menyimpan. Jika slot baru terisi, jadwal
            sebelumnya tetap aman. Unit dan harga tidak berubah.
          </p>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary full-width"
            type="submit"
            disabled={busy}
            style={{ marginTop: 20 }}
          >
            {busy ? 'Memeriksa slot…' : 'Simpan jadwal baru'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
