'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MapPin,
  Star,
  Check,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { type Venue, today, dateLabel, money } from '@/lib/catalog';
import { validSlot } from '@/lib/booking-domain';
import { Choice, api } from './shared';
type Slot = { unit: string; hour: number; status: string };
export function BookingFlow({
  venue,
  initialDate,
  onClose,
  onBooked,
  signedIn,
}: {
  venue: Venue;
  initialDate: string;
  onClose: () => void;
  onBooked: () => void;
  signedIn: boolean;
}) {
  const [date, setDate] = useState(initialDate || today());
  const [unit, setUnit] = useState(venue.units[0]);
  const [hour, setHour] = useState<number | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState<{
    holdId: string;
    expiresAt: number;
  } | null>(null);
  const [remaining, setRemaining] = useState(600);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState('full');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  useEffect(() => {
    let active = true;
    let pending = false;
    const load = async () => {
      if (pending) return;
      pending = true;
      try {
        const r = await fetch(
          `/api/slotly?venue=${encodeURIComponent(venue.id)}&date=${date}`,
          { cache: 'no-store' },
        );
        const d = (await r.json()) as { error?: string; slots: Slot[] };
        if (!r.ok) throw new Error(d.error);
        if (active) {
          setSlots(d.slots);
          setLoading(false);
        }
      } catch {
        if (active) {
          setError(
            'Jadwal belum dapat dimuat. Periksa koneksi lalu pilih tanggal kembali.',
          );
          setLoading(true);
        }
      } finally {
        pending = false;
      }
    };
    queueMicrotask(() => setLoading(true));
    void load();
    const timer = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [venue.id, date]);
  useEffect(() => {
    if (!hold || step !== 1) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((hold.expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setStep(0);
        setHold(null);
        setHour(null);
        setError('Waktu reservasi habis. Pilih slot kembali.');
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [hold, step]);
  const close = () => {
    if (busy) return;
    if (hold && step !== 2)
      void api({ action: 'release', holdId: hold.holdId }).catch(() => {});
    onClose();
  };
  const reserve = async () => {
    setBusy(true);
    setError('');
    try {
      const r = await api<{ holdId: string; expiresAt: number }>({
        action: 'hold',
        venueId: venue.id,
        unit,
        date,
        hour,
      });
      setHold(r);
      setStep(1);
    } catch (e) {
      setError((e as Error).message);
      setHour(null);
    } finally {
      setBusy(false);
    }
  };
  const pay = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hold) return;
    setBusy(true);
    setError('');
    try {
      await api({
        action: 'checkout',
        holdId: hold.holdId,
        payment,
        name,
        phone,
      });
      setStep(2);
      onBooked();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="booking-dialog" showCloseButton={!busy}>
        <DialogTitle className="sr-only">
          {step === 0
            ? venue.name
            : step === 1
              ? 'Konfirmasi reservasi'
              : 'Reservasi berhasil'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Pilih jadwal, periksa biaya, dan simulasikan reservasi.
        </DialogDescription>
        {step === 0 ? (
          <>
            <div
              className="detail-photo"
              style={{ backgroundImage: `url(${venue.image})` }}
            >
              <span className="detail-tag">VENUE CONTOH · FOTO ILUSTRASI</span>
            </div>
            <div className="detail-body">
              <div className="detail-title">
                <span className="eyebrow">{venue.category}</span>
                <span className="rating">
                  <Star size={15} fill="currentColor" />
                  {venue.rating || 'Baru'}{' '}
                  <small>({venue.reviews} ulasan contoh)</small>
                </span>
              </div>
              <h2>{venue.name}</h2>
              <p className="detail-location">
                <MapPin size={15} />
                {venue.area}, {venue.city}
              </p>
              <p className="detail-description">{venue.description}</p>
              <div className="facilities">
                {venue.facilities.map((f) => (
                  <span key={f}>
                    <Check size={13} />
                    {f}
                  </span>
                ))}
              </div>
              <div className="booking-fields">
                <label>
                  Tanggal
                  <input
                    type="date"
                    aria-label="Tanggal reservasi"
                    value={date}
                    min={today()}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setHour(null);
                      setError('');
                    }}
                    required
                  />
                </label>
                <label>
                  Unit / layanan
                  <Choice
                    label="Pilih unit"
                    value={unit}
                    onChange={(v) => {
                      setUnit(v);
                      setHour(null);
                    }}
                    options={venue.units.map((u) => ({ value: u, label: u }))}
                  />
                </label>
              </div>
              <div className="slot-heading">
                <h3>Pilih waktu mulai</h3>
                <span>
                  <i />{' '}
                  {loading ? 'Memuat jadwal…' : 'Diperbarui setiap 3 detik'}
                </span>
              </div>
              <div className="slot-grid">
                {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => {
                  const disabled =
                    loading ||
                    !validSlot(date, h) ||
                    slots.some((s) => s.unit === unit && s.hour === h);
                  return (
                    <button
                      key={h}
                      disabled={disabled}
                      onClick={() => setHour(h)}
                      aria-pressed={hour === h}
                      className={hour === h ? 'chosen' : ''}
                    >
                      {String(h).padStart(2, '0')}.00
                      {disabled && <small>Tidak tersedia</small>}
                    </button>
                  );
                })}
              </div>
              <p className="fine-print">
                <Clock size={14} /> Durasi 60 menit · Jam operasional
                08.00–22.00 WIB
              </p>
              {error && (
                <p role="alert" className="error-message">
                  {error}
                </p>
              )}
              <div className="detail-bottom">
                <div>
                  <small>Total per slot</small>
                  <strong>{money(venue.price)}</strong>
                </div>
                {signedIn ? (
                  <button
                    className="primary"
                    onClick={reserve}
                    disabled={hour === null || busy || loading}
                  >
                    {busy ? (
                      <Loader2 className="spin" size={17} />
                    ) : (
                      <>
                        Lanjut reservasi
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    className="primary"
                    href="/signin"
                  >
                    Masuk untuk reservasi
                  </Link>
                )}
              </div>
              <p className="fine-print">
                Batalkan minimal 24 jam sebelum jadwal. Semua transaksi saat ini
                adalah simulasi, tanpa pembayaran sungguhan.
              </p>
            </div>
          </>
        ) : step === 1 ? (
          <form onSubmit={pay} className="checkout-body">
            <button
              type="button"
              className="text-button"
              onClick={() => {
                if (hold)
                  void api({ action: 'release', holdId: hold.holdId }).catch(
                    () => {},
                  );
                setHold(null);
                setStep(0);
                setHour(null);
              }}
              disabled={busy}
            >
              <ArrowLeft size={16} /> Pilih jadwal lagi
            </button>
            <h2>Tinggal satu langkah lagi.</h2>
            <p className="muted">Pastikan detail reservasimu sudah sesuai.</p>
            <div className="hold-banner">
              <Clock size={17} />
              Slot disimpan untukmu
              <span>
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="checkout-venue">
              <Image
                src={venue.image}
                alt={venue.name}
                width={85}
                height={75}
                unoptimized
              />
              <div>
                <h3>{venue.name}</h3>
                <p>{unit}</p>
                <span>
                  {dateLabel(date)} · {hour}.00 WIB
                </span>
              </div>
            </div>
            <div className="booking-fields">
              <label>
                Nama pemesan
                <input
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Nomor HP
                <input
                  autoComplete="tel"
                  type="tel"
                  required
                  pattern="\+?[0-9]{9,15}"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </div>
            <label className="field-label">
              Pilihan pembayaran
              <Choice
                label="Pilihan pembayaran"
                value={payment}
                onChange={setPayment}
                options={[
                  { value: 'full', label: 'Bayar penuh (100%)' },
                  { value: 'dp', label: 'Uang muka (50%)' },
                ]}
              />
            </label>
            <div className="price-breakdown">
              <p>
                <span>Harga 1 slot × 60 menit</span>
                <span>{money(venue.price)}</span>
              </p>
              <p>
                <span>Biaya layanan</span>
                <span>Gratis</span>
              </p>
              {payment === 'dp' && (
                <p>
                  <span>Sisa pembayaran di tempat</span>
                  <span>{money(Math.floor(venue.price / 2))}</span>
                </p>
              )}
              <p className="total">
                <strong>Total simulasi</strong>
                <strong>
                  {money(
                    payment === 'dp' ? Math.ceil(venue.price / 2) : venue.price,
                  )}
                </strong>
              </p>
            </div>
            <div className="demo-notice">
              <ShieldCheck size={20} />
              <p>
                <strong>Mode demo — tidak ada uang ditagihkan.</strong>
                <span>
                  Simulasi ini menyimpan booking dan memperbarui ketersediaan.
                  Pembayaran bank, QRIS, dan e-wallet belum diaktifkan.
                </span>
              </p>
            </div>
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || remaining === 0}
              className="primary full-width"
            >
              {busy ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <>
                  Konfirmasi booking demo
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="success-body">
            <span className="success-icon">
              <CheckCircle2 size={42} />
            </span>
            <p className="eyebrow">RENCANAMU SUDAH TERSIMPAN</p>
            <h2>Yeay, slot jadi milikmu!</h2>
            <p>
              Reservasi demo berhasil. Sampai bertemu di
              <br />
              <strong>{venue.name}</strong>.
            </p>
            <div className="ticket">
              <span>KODE BOOKING</span>
              <strong>SL-{hold?.holdId.slice(0, 8).toUpperCase()}</strong>
              <hr />
              <p>
                <CalendarDays size={17} />
                {dateLabel(date)}
              </p>
              <p>
                <Clock size={17} />
                {hour}.00–{(hour ?? 0) + 1}.00 WIB · {unit}
              </p>
              <small>
                {money(
                  payment === 'dp' ? Math.ceil(venue.price / 2) : venue.price,
                )}{' '}
                · Pembayaran simulasi
              </small>
            </div>
            <p className="fine-print">
              Konfirmasi tersedia di notifikasi aplikasi. Email dan WhatsApp
              belum dikirim.
            </p>
            <button className="primary full-width" onClick={close}>
              Lihat booking saya <ArrowRight size={17} />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
