'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CalendarDays,
  ArrowUpRight,
  Ticket,
  Wallet,
  TrendingUp,
  Clock,
  Download,
  Plus,
  Store,
  Star,
  Check,
  Loader2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { api, Choice, type Booking } from './shared';
import {
  venues,
  categories,
  money,
  dateLabel,
  today,
  type Venue,
} from '@/lib/catalog';
import { RescheduleDialog } from './reschedule-dialog';
import { canCancel } from '@/lib/booking-domain';
const bookingDuration = (booking: Booking) => booking.duration ?? 1;
export function BookingHistory({
  bookings,
  allVenues,
  refresh,
  explore,
  reviewed,
}: {
  bookings: Booking[];
  allVenues: Venue[];
  refresh: () => void;
  explore: () => void;
  reviewed: string[];
}) {
  const [tab, setTab] = useState('all');
  const [reschedule, setReschedule] = useState<Booking | null>(null);
  const [cancel, setCancel] = useState<Booking | null>(null);
  const [review, setReview] = useState<Booking | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const status = (b: Booking) =>
    b.status === 'cancelled'
      ? 'cancelled'
      : Date.parse(
            `${b.date}T${String(b.hour + bookingDuration(b)).padStart(2, '0')}:00:00+07:00`,
          ) < now
        ? 'completed'
        : 'confirmed';
  const filtered = bookings.filter((b) => tab === 'all' || status(b) === tab);
  const act = async (action: string, b: Booking) => {
    setBusy(true);
    setError('');
    try {
      await api({ action, bookingId: b.id, rating: Number(rating), comment });
      setCancel(null);
      setReview(null);
      setComment('');
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section>
      <div className="view-heading">
        <div>
          <p className="eyebrow">SEMUA RENCANA, SATU TEMPAT</p>
          <h1>Booking saya</h1>
          <p>Lihat jadwal mendatang dan momen yang sudah kamu nikmati.</p>
        </div>
        <button className="primary" onClick={explore}>
          Booking lagi <Plus size={17} />
        </button>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <TabsList className="view-tabs">
          {[
            ['all', 'Semua'],
            ['confirmed', 'Mendatang'],
            ['completed', 'Selesai'],
            ['cancelled', 'Dibatalkan'],
          ].map(([v, l]) => (
            <TabsTrigger value={v} key={v}>
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="booking-list">
        {filtered.map((b) => {
          const v = allVenues.find((v) => v.id === b.venue_id);
          const st = status(b);
          return (
            <article className="booking-card" key={b.id}>
              <Image
                src={v?.image ?? venues[0].image}
                alt={v?.name ?? 'Tempat reservasi'}
                width={150}
                height={135}
                unoptimized
              />
              <div className="booking-card-info">
                <div className="booking-code">
                  SL-{b.id.slice(0, 8).toUpperCase()}{' '}
                  <span className={`status ${st}`}>
                    {st === 'confirmed'
                      ? 'Dikonfirmasi'
                      : st === 'completed'
                        ? 'Selesai'
                        : 'Dibatalkan'}
                  </span>
                </div>
                <h3>{v?.name ?? 'Tempat reservasi'}</h3>
                <p>
                  {b.unit} · {dateLabel(b.date)}
                </p>
                <p>
                  <Clock size={14} /> {String(b.hour).padStart(2, '0')}.00–
                  {String(b.hour + bookingDuration(b)).padStart(2, '0')}.00 WIB
                  · {bookingDuration(b)} jam
                </p>
                <small>
                  Pembayaran simulasi · {b.paid < b.price ? 'DP 50%' : 'Lunas'}
                </small>
              </div>
              <div className="booking-card-actions">
                <strong>{money(b.price)}</strong>
                {st === 'confirmed' && canCancel(b.date, b.hour) && (
                  <button className="outline" onClick={() => setReschedule(b)}>
                    Ubah jadwal
                  </button>
                )}
                {st === 'confirmed' && canCancel(b.date, b.hour) && (
                  <button
                    className="outline danger"
                    onClick={() => {
                      setError('');
                      setCancel(b);
                    }}
                  >
                    Batalkan
                  </button>
                )}
                {st === 'confirmed' && !canCancel(b.date, b.hour) && (
                  <small>Jadwal kurang dari 24 jam</small>
                )}
                {st === 'completed' && !reviewed.includes(b.id) && (
                  <button
                    className="outline"
                    onClick={() => {
                      setError('');
                      setReview(b);
                    }}
                  >
                    <Star size={15} />
                    Beri ulasan
                  </button>
                )}
                {reviewed.includes(b.id) && (
                  <span className="fine-print">
                    <Check size={13} />
                    Ulasan tersimpan
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state">
          <Ticket size={38} />
          <h3>
            Belum ada booking{' '}
            {tab === 'all'
              ? ''
              : tab === 'confirmed'
                ? 'mendatang'
                : tab === 'completed'
                  ? 'selesai'
                  : 'dibatalkan'}
          </h3>
          <p>Mulai rencana baru dengan menemukan tempat favoritmu.</p>
          <button className="primary" onClick={explore}>
            Jelajahi tempat <ArrowUpRight size={17} />
          </button>
        </div>
      )}
      {reschedule && (
        <RescheduleDialog
          booking={reschedule}
          onClose={() => setReschedule(null)}
          onSaved={refresh}
        />
      )}
      <AlertDialog
        open={!!cancel}
        onOpenChange={(v) => !v && !busy && setCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Batalkan reservasi ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Slot akan tersedia kembali untuk pengguna lain. Pembayaran ini
            merupakan simulasi sehingga tidak ada dana yang dikembalikan.
          </AlertDialogDescription>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Tetap simpan</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                if (cancel) void act('cancel', cancel);
              }}
            >
              Ya, batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={!!review}
        onOpenChange={(v) => !v && !busy && setReview(null)}
      >
        <DialogContent className="standard-dialog">
          <DialogTitle>Bagaimana pengalamanmu?</DialogTitle>
          <DialogDescription>
            Ulasanmu membantu pelanggan lain memilih.
          </DialogDescription>
          <Choice
            value={rating}
            onChange={setRating}
            label="Rating"
            options={[5, 4, 3, 2, 1].map((n) => ({
              value: String(n),
              label: '★'.repeat(n) + ' · ' + n + '/5',
            }))}
          />
          <textarea
            className="text-input"
            aria-label="Ulasan"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            placeholder="Ceritakan pengalamanmu (minimal 5 karakter)"
          />
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <button
            className="primary"
            disabled={busy || comment.trim().length < 5}
            onClick={() => review && act('review', review)}
          >
            Simpan ulasan
          </button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
export type ManagedVenue = {
  id: string;
  status: string;
  data: Venue;
};
export function AdminDashboard({
  refresh,
  managedVenues,
  transactions,
  commission,
}: {
  refresh: () => void;
  managedVenues: ManagedVenue[];
  transactions: Booking[];
  commission: number;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [cat, setCat] = useState('Olahraga');
  const [feedback, setFeedback] = useState('');
  const [fee, setFee] = useState(commission);
  const run = async (payload: Record<string, unknown>) => {
    setBusy(true);
    setError('');
    setFeedback('');
    try {
      await api(payload);
      refresh();
      setFeedback('Perubahan berhasil disimpan.');
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const submit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      await run({
        action: 'adminVenue',
        name: f.get('name'),
        category: cat,
        price: Number(f.get('price')),
        area: f.get('area'),
        description: f.get('description'),
        units: (f.get('units') as string)
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean),
      })
    )
      setOpen(false);
  };
  const rows = transactions;
  const active = rows.filter((b) => b.status === 'confirmed');
  const revenue = active.reduce((s, b) => s + b.paid, 0);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  });
  const values = dates.map((d) => active.filter((b) => b.date === d).length);
  const max = Math.max(...values, 1);
  const exportCsv = () => {
    const esc = (v: unknown) =>
      '"' +
      String(v)
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const csv =
      '\uFEFF' +
      [
        [
          'Kode',
          'Tanggal',
          'Jam',
          'Durasi',
          'Unit',
          'Status',
          'Total',
          'Dibayar (simulasi)',
        ],
        ...rows.map((b) => [
          b.id,
          b.date,
          b.hour,
          bookingDuration(b),
          b.unit ?? '-',
          b.status,
          b.price,
          b.paid,
        ]),
      ]
        .map((r) => r.map(esc).join(','))
        .join('\r\n');
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slotly-laporan.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section>
      <div className="view-heading">
        <div>
          <p className="eyebrow">KELOLA PLATFORM</p>
          <h1>Admin platform</h1>
          <p>Tambahkan tempat dan pantau transaksi platform.</p>
        </div>
        <div className="view-actions">
          <button
            className="outline"
            onClick={exportCsv}
            disabled={!rows.length}
          >
            <Download size={16} />
            Unduh CSV
          </button>
          <button className="primary" onClick={() => setOpen(true)}>
            <Plus size={17} />
            Tambah tempat
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {feedback && <output className="success-message">{feedback}</output>}
      <div className="stat-grid">
        {[
          [Ticket, 'Total booking', String(rows.length), 'Reservasi tercatat'],
          [
            Wallet,
            'Pendapatan simulasi',
            money(revenue),
            'Belum ada pembayaran riil',
          ],
          [
            CalendarDays,
            'Booking hari ini',
            String(active.filter((b) => b.date === today()).length),
            'Sesuai jadwal reservasi',
          ],
          [
            TrendingUp,
            'Komisi platform',
            commission + '%',
            'Dari nilai transaksi',
          ],
        ].map(([Icon, title, value, caption]) => {
          const I = Icon as typeof Ticket;
          return (
            <div className="stat-card" key={String(title)}>
              <span>
                <I size={18} />
                {String(title)}
              </span>
              <strong>{String(value)}</strong>
              <small>{String(caption)}</small>
            </div>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Aktivitas reservasi</h2>
            <span>7 hari terakhir</span>
          </div>
          <div className="chart">
            {dates.map((d, i) => (
              <div key={d} className="chart-column">
                <span>{values[i]}</span>
                <div className="chart-track">
                  <div style={{ height: `${(values[i] / max) * 100}%` }} />
                </div>
                <small>
                  {new Date(d + 'T12:00:00').toLocaleDateString('id-ID', {
                    weekday: 'short',
                  })}
                </small>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Pengaturan komisi</h2>
          <p className="muted">Berlaku untuk perhitungan komisi platform.</p>
          <label className="field-label">
            Persentase komisi
            <input
              className="text-input"
              type="number"
              min={0}
              max={30}
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
            />
          </label>
          <button
            className="primary"
            disabled={busy}
            onClick={() => run({ action: 'commission', value: fee })}
          >
            Simpan komisi
          </button>
        </div>
      </div>
      <div className="panel">
        <div className="panel-heading">
          <h2>Tempat yang ditambahkan admin</h2>
          <span>{managedVenues.length} tempat</span>
        </div>
        {managedVenues.length === 0 ? (
          <div className="panel-empty">
            <Store size={30} />
            <p>Belum ada tempat tambahan.</p>
          </div>
        ) : (
          managedVenues.map((m) => (
            <div className="application" key={m.id}>
              <div>
                <h3>{m.data.name}</h3>
                <p>
                  {m.data.category} · {m.data.area} · {m.data.units.length} unit
                  · {money(m.data.price)}/jam
                </p>
                <span className="status approved">Aktif</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="panel">
        <div className="panel-heading">
          <h2>Reservasi terbaru</h2>
          <span>{rows.length} transaksi</span>
        </div>
        {rows.length === 0 ? (
          <div className="panel-empty">
            <Ticket size={30} />
            <p>Reservasi pertama akan muncul di sini.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {['Kode', 'Tanggal', 'Waktu', 'Status', 'Total simulasi'].map(
                  (h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>SL-{b.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{dateLabel(b.date)}</TableCell>
                  <TableCell>
                    {String(b.hour).padStart(2, '0')}.00–
                    {String(b.hour + bookingDuration(b)).padStart(2, '0')}.00
                    WIB
                  </TableCell>
                  <TableCell>
                    <span className={`status ${b.status}`}>
                      {b.status === 'confirmed' ? 'Dikonfirmasi' : 'Dibatalkan'}
                    </span>
                  </TableCell>
                  <TableCell>{money(b.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent className="standard-dialog">
          <DialogTitle>Tambah tempat</DialogTitle>
          <DialogDescription>
            Tempat akan langsung aktif dan muncul di halaman pencarian.
          </DialogDescription>
          <form onSubmit={submit} className="merchant-form">
            <label>
              Nama usaha
              <input
                required
                name="name"
                minLength={3}
                maxLength={100}
                placeholder="Contoh: Arena Padel Kemang"
              />
            </label>
            <label>
              Kategori
              <Choice
                label="Kategori usaha"
                value={cat}
                onChange={setCat}
                options={categories
                  .slice(1)
                  .map((c) => ({ value: c, label: c }))}
              />
            </label>
            <div className="booking-fields">
              <label>
                Area (Jakarta Selatan)
                <input
                  required
                  name="area"
                  minLength={2}
                  maxLength={80}
                  placeholder="Kemang"
                />
              </label>
              <label>
                Harga per jam (Rp)
                <input
                  required
                  name="price"
                  type="number"
                  min={1000}
                  max={10000000}
                  step={1000}
                  defaultValue={100000}
                />
              </label>
            </div>
            <label>
              Unit / layanan (pisahkan dengan koma)
              <input
                required
                name="units"
                placeholder="Lapangan A, Lapangan B"
              />
            </label>
            <label>
              Deskripsi usaha
              <textarea
                required
                minLength={20}
                maxLength={1000}
                name="description"
                placeholder="Ceritakan fasilitas dan pengalaman di tempatmu..."
              />
            </label>
            <p className="fine-print">
              Jam operasional awal 08.00–22.00 WIB, slot 60 menit. Foto
              sementara menggunakan ilustrasi sesuai kategori.
            </p>
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            <button type="submit" className="primary" disabled={busy}>
              {busy ? (
                <Loader2 className="spin" size={17} />
              ) : (
                <>
                  Tambahkan tempat <ArrowUpRight size={17} />
                </>
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
