'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Ban,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  LayoutDashboard,
  Loader2,
  MapPin,
  Plus,
  Search,
  Settings2,
  Store,
  Ticket,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  categories,
  dateLabel,
  jakartaCities,
  money,
  today,
  type Venue,
} from '@/lib/catalog';
import { api, Choice, type Booking } from './shared';

export type ManagedVenue = {
  id: string;
  status: string;
  data: Venue;
};

type ScheduleSlot = { unit: string; hour: number; status: string };

const bookingDuration = (booking: Booking) => booking.duration ?? 1;
const statusLabel = (status: string) =>
  status === 'confirmed' ? 'Dikonfirmasi' : 'Dibatalkan';

export function AdminDashboard({
  refresh,
  managedVenues,
  transactions,
  commission,
  allVenues,
}: {
  refresh: () => void | Promise<void>;
  managedVenues: ManagedVenue[];
  transactions: Booking[];
  commission: number;
  allVenues: Venue[];
}) {
  const [tab, setTab] = useState('overview');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [cat, setCat] = useState('Olahraga');
  const [city, setCity] = useState('Jakarta Selatan');
  const [fee, setFee] = useState(commission);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [venueQuery, setVenueQuery] = useState('');
  const [venueCity, setVenueCity] = useState('all');
  const [scheduleVenue, setScheduleVenue] = useState(allVenues[0]?.id ?? '');
  const selectedVenue =
    allVenues.find((venue) => venue.id === scheduleVenue) ?? allVenues[0];
  const [scheduleUnit, setScheduleUnit] = useState(
    selectedVenue?.units[0] ?? '',
  );
  const [scheduleDate, setScheduleDate] = useState(today());
  const [scheduleHour, setScheduleHour] = useState(8);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const active = transactions.filter(
    (booking) => booking.status === 'confirmed',
  );
  const cancelled = transactions.filter(
    (booking) => booking.status === 'cancelled',
  );
  const grossRevenue = active.reduce((sum, booking) => sum + booking.price, 0);
  const paidRevenue = active.reduce((sum, booking) => sum + booking.paid, 0);
  const averageTicket = active.length
    ? Math.round(grossRevenue / active.length)
    : 0;
  const commissionValue = Math.round((grossRevenue * commission) / 100);
  const todayBookings = active.filter(
    (booking) => booking.date === today(),
  ).length;
  const upcomingBookings = active.filter(
    (booking) => booking.date >= today(),
  ).length;
  const cancellationRate = transactions.length
    ? Math.round((cancelled.length / transactions.length) * 100)
    : 0;

  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + index);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  });
  const chartValues = dates.map(
    (date) => active.filter((booking) => booking.date === date).length,
  );
  const chartMax = Math.max(...chartValues, 1);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return transactions.filter((booking) => {
      const venue = allVenues.find((item) => item.id === booking.venue_id);
      const searchable = [
        booking.id,
        booking.name,
        booking.phone,
        booking.unit,
        venue?.name,
      ]
        .join(' ')
        .toLowerCase();
      const periodMatches =
        periodFilter === 'all' ||
        (periodFilter === 'today' && booking.date === today()) ||
        (periodFilter === 'upcoming' && booking.date >= today()) ||
        (periodFilter === 'past' && booking.date < today());
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (statusFilter === 'all' || booking.status === statusFilter) &&
        periodMatches
      );
    });
  }, [allVenues, periodFilter, query, statusFilter, transactions]);

  const filteredVenues = useMemo(() => {
    const normalizedQuery = venueQuery.trim().toLowerCase();
    return allVenues.filter(
      (venue) =>
        (!normalizedQuery ||
          `${venue.name} ${venue.area} ${venue.category}`
            .toLowerCase()
            .includes(normalizedQuery)) &&
        (venueCity === 'all' || venue.city === venueCity),
    );
  }, [allVenues, venueCity, venueQuery]);

  const run = async (payload: Record<string, unknown>, message: string) => {
    setBusy(true);
    setError('');
    setFeedback('');
    try {
      await api(payload);
      await refresh();
      setFeedback(message);
      return true;
    } catch (problem) {
      setError((problem as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitVenue = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const unitsValue = form.get('units');
    const saved = await run(
      {
        action: 'adminVenue',
        name: form.get('name'),
        category: cat,
        price: Number(form.get('price')),
        area: form.get('area'),
        city,
        description: form.get('description'),
        units:
          typeof unitsValue === 'string'
            ? unitsValue
                .split(',')
                .map((unit) => unit.trim())
                .filter(Boolean)
            : [],
      },
      'Tempat baru berhasil ditambahkan ke katalog.',
    );
    if (saved) setOpen(false);
  };

  const loadSchedule = async (
    venueId = selectedVenue?.id,
    date = scheduleDate,
  ) => {
    if (!venueId || !date) return;
    setScheduleLoading(true);
    try {
      const response = await fetch(
        `/api/slotly?venue=${encodeURIComponent(venueId)}&date=${date}`,
        { cache: 'no-store' },
      );
      const data = (await response.json()) as {
        error?: string;
        slots?: ScheduleSlot[];
      };
      if (!response.ok) throw new Error(data.error);
      setScheduleSlots(data.slots ?? []);
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setScheduleLoading(false);
    }
  };

  const selectedScheduleSlot = scheduleSlots.find(
    (slot) => slot.unit === scheduleUnit && slot.hour === scheduleHour,
  );

  const updateSchedule = async () => {
    if (!selectedVenue) return;
    if (selectedScheduleSlot && selectedScheduleSlot.status !== 'blocked') {
      setError(
        'Slot tersebut berasal dari reservasi dan tidak dapat dibuka manual.',
      );
      return;
    }
    const unblocking = selectedScheduleSlot?.status === 'blocked';
    const saved = await run(
      {
        action: unblocking ? 'unblock' : 'block',
        venueId: selectedVenue.id,
        unit: scheduleUnit,
        date: scheduleDate,
        hour: scheduleHour,
      },
      unblocking
        ? 'Blokir slot berhasil dibuka.'
        : 'Slot berhasil diblokir dari pemesanan.',
    );
    if (saved) await loadSchedule();
  };

  const exportCsv = () => {
    const escapeCell = (value: unknown) =>
      `"${String(value)
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""')}"`;
    const csv =
      '\uFEFF' +
      [
        [
          'Kode',
          'Tempat',
          'Tanggal',
          'Jam',
          'Durasi',
          'Unit',
          'Pemesan',
          'Status',
          'Total',
          'Dibayar (simulasi)',
        ],
        ...filteredRows.map((booking) => [
          booking.id,
          allVenues.find((venue) => venue.id === booking.venue_id)?.name ?? '-',
          booking.date,
          booking.hour,
          bookingDuration(booking),
          booking.unit,
          booking.name,
          booking.status,
          booking.price,
          booking.paid,
        ]),
      ]
        .map((row) => row.map(escapeCell).join(','))
        .join('\r\n');
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `slotly-transaksi-${today()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const renderTransactionTable = (rows: Booking[]) =>
    rows.length === 0 ? (
      <div className="admin-empty">
        <Search size={28} />
        <strong>Tidak ada transaksi yang cocok</strong>
        <p>Ubah kata kunci atau filter untuk melihat transaksi lainnya.</p>
      </div>
    ) : (
      <div className="admin-table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              {['Reservasi', 'Pemesan', 'Jadwal', 'Status', 'Nilai'].map(
                (heading) => (
                  <TableHead key={heading}>{heading}</TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((booking) => {
              const venue = allVenues.find(
                (item) => item.id === booking.venue_id,
              );
              return (
                <TableRow key={booking.id}>
                  <TableCell>
                    <strong className="admin-table-primary">
                      {venue?.name ?? 'Tempat reservasi'}
                    </strong>
                    <small>SL-{booking.id.slice(0, 8).toUpperCase()}</small>
                  </TableCell>
                  <TableCell>
                    <strong className="admin-table-primary">
                      {booking.name || 'Pelanggan'}
                    </strong>
                    <small>{booking.unit}</small>
                  </TableCell>
                  <TableCell>
                    <strong className="admin-table-primary">
                      {dateLabel(booking.date)}
                    </strong>
                    <small>
                      {String(booking.hour).padStart(2, '0')}.00–
                      {String(booking.hour + bookingDuration(booking)).padStart(
                        2,
                        '0',
                      )}
                      .00 WIB
                    </small>
                  </TableCell>
                  <TableCell>
                    <span className={`status ${booking.status}`}>
                      {statusLabel(booking.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <strong className="admin-value">
                      {money(booking.price)}
                    </strong>
                    <small>Dibayar {money(booking.paid)}</small>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );

  return (
    <section className="admin-dashboard">
      <div className="admin-hero">
        <div>
          <span className="admin-kicker">
            <LayoutDashboard size={14} /> PUSAT KENDALI
          </span>
          <h1>Admin Platform</h1>
          <p>
            Pantau performa, kelola venue, dan atur ketersediaan dari satu
            tempat.
          </p>
        </div>
        <div className="admin-hero-actions">
          <button
            className="outline"
            onClick={exportCsv}
            disabled={!filteredRows.length}
          >
            <Download size={17} /> Ekspor data
          </button>
          <button className="primary" onClick={() => setOpen(true)}>
            <Plus size={18} /> Tambah tempat
          </button>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          const nextTab = String(value);
          setTab(nextTab);
          if (nextTab === 'schedule') void loadSchedule();
        }}
      >
        <TabsList className="admin-tabs">
          {[
            ['overview', LayoutDashboard, 'Ringkasan'],
            ['transactions', Ticket, 'Transaksi'],
            ['venues', Building2, 'Tempat'],
            ['schedule', CalendarClock, 'Jadwal'],
          ].map(([value, Icon, label]) => {
            const TabIcon = Icon as typeof LayoutDashboard;
            return (
              <TabsTrigger value={String(value)} key={String(value)}>
                <TabIcon size={16} /> {String(label)}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {feedback && <output className="success-message">{feedback}</output>}

      {tab === 'overview' && (
        <>
          <div className="admin-stat-grid">
            {[
              [
                Ticket,
                'Total booking',
                transactions.length,
                `${todayBookings} hari ini`,
                'green',
              ],
              [
                Wallet,
                'Nilai transaksi',
                money(grossRevenue),
                `${money(paidRevenue)} dibayar`,
                'forest',
              ],
              [
                TrendingUp,
                'Rata-rata booking',
                money(averageTicket),
                `${upcomingBookings} mendatang`,
                'blue',
              ],
              [
                CircleDollarSign,
                'Estimasi komisi',
                money(commissionValue),
                `${commission}% dari transaksi`,
                'amber',
              ],
            ].map(([Icon, title, value, note, tone]) => {
              const StatIcon = Icon as typeof Ticket;
              return (
                <article
                  className={`admin-stat-card ${String(tone)}`}
                  key={String(title)}
                >
                  <div className="admin-stat-top">
                    <span>
                      <StatIcon size={18} />
                    </span>
                    <small>{String(note)}</small>
                  </div>
                  <p>{String(title)}</p>
                  <strong>{String(value)}</strong>
                </article>
              );
            })}
          </div>

          <div className="admin-overview-grid">
            <article className="admin-panel admin-chart-panel">
              <div className="admin-panel-heading">
                <div>
                  <span>PERFORMA</span>
                  <h2>Aktivitas reservasi</h2>
                </div>
                <small>7 hari terakhir</small>
              </div>
              <div className="admin-chart">
                {dates.map((date, index) => (
                  <div className="admin-chart-column" key={date}>
                    <span>{chartValues[index]}</span>
                    <div className="admin-chart-track">
                      <div
                        style={{
                          height: `${Math.max(4, (chartValues[index] / chartMax) * 100)}%`,
                        }}
                      />
                    </div>
                    <small>
                      {new Date(`${date}T12:00:00`).toLocaleDateString(
                        'id-ID',
                        { weekday: 'short' },
                      )}
                    </small>
                  </div>
                ))}
              </div>
            </article>

            <aside className="admin-insight-stack">
              <article className="admin-panel admin-health-card">
                <div className="admin-panel-heading">
                  <div>
                    <span>OPERASIONAL</span>
                    <h2>Kondisi platform</h2>
                  </div>
                  <CheckCircle2 size={20} />
                </div>
                <div className="admin-health-row">
                  <span>
                    <CalendarDays size={16} /> Booking mendatang
                  </span>
                  <strong>{upcomingBookings}</strong>
                </div>
                <div className="admin-health-row">
                  <span>
                    <XCircle size={16} /> Tingkat pembatalan
                  </span>
                  <strong>{cancellationRate}%</strong>
                </div>
                <div className="admin-health-row">
                  <span>
                    <Store size={16} /> Venue aktif
                  </span>
                  <strong>{allVenues.length}</strong>
                </div>
              </article>

              <article className="admin-panel admin-commission-card">
                <div className="admin-panel-heading">
                  <div>
                    <span>PENGATURAN</span>
                    <h2>Komisi platform</h2>
                  </div>
                  <Settings2 size={19} />
                </div>
                <p>Persentase diterapkan pada perhitungan laporan platform.</p>
                <div className="admin-commission-control">
                  <input
                    aria-label="Persentase komisi"
                    type="number"
                    min={0}
                    max={30}
                    value={fee}
                    onChange={(event) => setFee(Number(event.target.value))}
                  />
                  <span>%</span>
                  <button
                    className="primary"
                    disabled={busy || fee === commission}
                    onClick={() =>
                      void run(
                        { action: 'commission', value: fee },
                        'Komisi platform berhasil diperbarui.',
                      )
                    }
                  >
                    Simpan
                  </button>
                </div>
              </article>
            </aside>
          </div>

          <article className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span>TERBARU</span>
                <h2>Reservasi terbaru</h2>
              </div>
              <button
                className="text-button"
                onClick={() => setTab('transactions')}
              >
                Lihat semua <ArrowUpRight size={15} />
              </button>
            </div>
            {renderTransactionTable(transactions.slice(0, 5))}
          </article>
        </>
      )}

      {tab === 'transactions' && (
        <article className="admin-panel admin-workspace-panel">
          <div className="admin-panel-heading admin-section-heading">
            <div>
              <span>DATA PLATFORM</span>
              <h2>Semua transaksi</h2>
              <p>
                {filteredRows.length} dari {transactions.length} transaksi
                ditampilkan
              </p>
            </div>
            <button
              className="outline compact"
              onClick={exportCsv}
              disabled={!filteredRows.length}
            >
              <Download size={16} /> Unduh hasil
            </button>
          </div>
          <div className="admin-filter-bar">
            <label className="admin-search">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari kode, venue, unit, atau pemesan..."
              />
            </label>
            <Choice
              label="Filter status transaksi"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Semua status' },
                { value: 'confirmed', label: 'Dikonfirmasi' },
                { value: 'cancelled', label: 'Dibatalkan' },
              ]}
            />
            <Choice
              label="Filter periode transaksi"
              value={periodFilter}
              onChange={setPeriodFilter}
              options={[
                { value: 'all', label: 'Semua periode' },
                { value: 'today', label: 'Hari ini' },
                { value: 'upcoming', label: 'Mendatang' },
                { value: 'past', label: 'Sudah lewat' },
              ]}
            />
          </div>
          {renderTransactionTable(filteredRows)}
        </article>
      )}

      {tab === 'venues' && (
        <article className="admin-panel admin-workspace-panel">
          <div className="admin-panel-heading admin-section-heading">
            <div>
              <span>KATALOG</span>
              <h2>Kelola tempat</h2>
              <p>{filteredVenues.length} venue aktif di katalog</p>
            </div>
            <button className="primary compact" onClick={() => setOpen(true)}>
              <Plus size={16} /> Tambah tempat
            </button>
          </div>
          <div className="admin-filter-bar venues">
            <label className="admin-search">
              <Search size={18} />
              <input
                value={venueQuery}
                onChange={(event) => setVenueQuery(event.target.value)}
                placeholder="Cari nama, kategori, atau area..."
              />
            </label>
            <Choice
              label="Filter wilayah venue"
              value={venueCity}
              onChange={setVenueCity}
              options={[
                { value: 'all', label: 'Seluruh Jakarta' },
                ...jakartaCities.map((value) => ({ value, label: value })),
              ]}
            />
          </div>
          <div className="admin-venue-grid">
            {filteredVenues.map((venue) => (
              <article className="admin-venue-card" key={venue.id}>
                <Image
                  src={venue.image}
                  alt=""
                  width={112}
                  height={104}
                  unoptimized
                />
                <div>
                  <div className="admin-venue-title">
                    <h3>{venue.name}</h3>
                    <span className="status approved">
                      {managedVenues.some((item) => item.id === venue.id)
                        ? 'Admin'
                        : 'Aktif'}
                    </span>
                  </div>
                  <p>
                    <MapPin size={14} /> {venue.area}, {venue.city}
                  </p>
                  <div className="admin-venue-meta">
                    <span>{venue.category}</span>
                    <span>{venue.units.length} unit</span>
                    <strong>{money(venue.price)}/jam</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>
      )}

      {tab === 'schedule' && (
        <div className="admin-schedule-layout">
          <article className="admin-panel admin-schedule-control">
            <div className="admin-panel-heading">
              <div>
                <span>KETERSEDIAAN</span>
                <h2>Atur jadwal venue</h2>
              </div>
              <CalendarClock size={20} />
            </div>
            <p className="admin-panel-copy">
              Blokir satu jam untuk perawatan, acara privat, atau kebutuhan
              operasional.
            </p>
            <label>
              Tempat
              <Choice
                label="Pilih tempat untuk jadwal"
                value={scheduleVenue}
                onChange={(value) => {
                  const venue = allVenues.find((item) => item.id === value);
                  setScheduleVenue(value);
                  setScheduleUnit(venue?.units[0] ?? '');
                  setScheduleHour(8);
                  setScheduleSlots([]);
                  void loadSchedule(value, scheduleDate);
                }}
                options={allVenues.map((venue) => ({
                  value: venue.id,
                  label: venue.name,
                }))}
              />
            </label>
            <label>
              Unit / layanan
              <Choice
                label="Pilih unit untuk jadwal"
                value={scheduleUnit}
                onChange={setScheduleUnit}
                options={(selectedVenue?.units ?? []).map((unit) => ({
                  value: unit,
                  label: unit,
                }))}
              />
            </label>
            <label>
              Tanggal
              <input
                type="date"
                min={today()}
                value={scheduleDate}
                onChange={(event) => {
                  const value = event.target.value;
                  setScheduleDate(value);
                  setScheduleSlots([]);
                  void loadSchedule(selectedVenue?.id, value);
                }}
              />
            </label>
            <div className="admin-slot-legend">
              <span>
                <i className="admin-dot admin-dot-available" /> Tersedia
              </span>
              <span>
                <i className="admin-dot admin-dot-blocked" /> Diblokir admin
              </span>
              <span>
                <i className="admin-dot admin-dot-booked" /> Sudah dipesan
              </span>
            </div>
          </article>

          <article className="admin-panel admin-slot-panel">
            <div className="admin-panel-heading">
              <div>
                <span>{selectedVenue?.name.toUpperCase()}</span>
                <h2>{scheduleUnit}</h2>
              </div>
              {scheduleLoading && <Loader2 className="spin" size={18} />}
            </div>
            <div className="admin-slot-grid">
              {Array.from({ length: 14 }, (_, index) => index + 8).map(
                (hour) => {
                  const slot = scheduleSlots.find(
                    (item) => item.unit === scheduleUnit && item.hour === hour,
                  );
                  const state =
                    slot?.status === 'blocked'
                      ? 'blocked'
                      : slot
                        ? 'booked'
                        : 'available';
                  return (
                    <button
                      type="button"
                      key={hour}
                      className={`${state} ${scheduleHour === hour ? 'selected' : ''}`}
                      onClick={() => setScheduleHour(hour)}
                    >
                      <Clock3 size={14} /> {String(hour).padStart(2, '0')}.00
                      <small>
                        {state === 'available'
                          ? 'Tersedia'
                          : state === 'blocked'
                            ? 'Diblokir'
                            : 'Terisi'}
                      </small>
                    </button>
                  );
                },
              )}
            </div>
            <div className="admin-slot-action">
              <div>
                <small>Slot terpilih</small>
                <strong>
                  {String(scheduleHour).padStart(2, '0')}.00–
                  {String(scheduleHour + 1).padStart(2, '0')}.00 WIB
                </strong>
              </div>
              <button
                className={
                  selectedScheduleSlot?.status === 'blocked'
                    ? 'outline'
                    : 'primary'
                }
                disabled={
                  busy ||
                  scheduleLoading ||
                  (!!selectedScheduleSlot &&
                    selectedScheduleSlot.status !== 'blocked')
                }
                onClick={() => void updateSchedule()}
              >
                {busy ? (
                  <Loader2 className="spin" size={17} />
                ) : selectedScheduleSlot?.status === 'blocked' ? (
                  <>
                    <CheckCircle2 size={17} /> Buka blokir
                  </>
                ) : (
                  <>
                    <Ban size={17} /> Blokir slot
                  </>
                )}
              </button>
            </div>
          </article>
        </div>
      )}

      <Dialog open={open} onOpenChange={(value) => !busy && setOpen(value)}>
        <DialogContent className="standard-dialog admin-venue-dialog">
          <DialogTitle>Tambah tempat baru</DialogTitle>
          <DialogDescription>
            Tempat akan langsung aktif dan muncul di halaman pencarian.
          </DialogDescription>
          <form onSubmit={submitVenue} className="merchant-form">
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
            <div className="booking-fields">
              <label>
                Kategori
                <Choice
                  label="Kategori usaha"
                  value={cat}
                  onChange={setCat}
                  options={categories
                    .slice(1)
                    .map((value) => ({ value, label: value }))}
                />
              </label>
              <label>
                Wilayah
                <Choice
                  label="Wilayah Jakarta"
                  value={city}
                  onChange={setCity}
                  options={jakartaCities.map((value) => ({
                    value,
                    label: value,
                  }))}
                />
              </label>
            </div>
            <div className="booking-fields">
              <label>
                Area / kecamatan
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
              Unit / layanan
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
