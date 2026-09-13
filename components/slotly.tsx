'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  MapPin,
  ChevronDown,
  Bell,
  Search,
  SlidersHorizontal,
  Heart,
  Compass,
  CalendarDays,
  ShieldCheck,
  CircleHelp,
  Sparkles,
  Star,
  Grid2X2,
  Dumbbell,
  Scissors,
  Camera,
  Mic2,
  Stethoscope,
} from 'lucide-react';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { venues, categories, money, today, type Venue } from '@/lib/catalog';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Choice, api, type Booking, type Notification } from './shared';
import { BookingFlow } from './booking-flow';
import {
  BookingHistory,
  AdminDashboard,
  type ManagedVenue,
} from './account-views';
import { InfoDialog } from './info-dialog';
import { SlotlyLogo } from './slotly-logo';
type AppData = {
  venues: Venue[];
  user: { name: string; email: string } | null;
  bookings: Booking[];
  favorites: string[];
  notifications: Notification[];
  isAdmin: boolean;
  managedVenues: ManagedVenue[];
  transactions: Booking[];
  commission: number;
  reviewed: string[];
};
const icons = [Grid2X2, Dumbbell, Scissors, Camera, Mic2, Stethoscope];
const navigation: [LucideIcon, string][] = [
  [Compass, 'Jelajahi'],
  [CalendarDays, 'Booking Saya'],
  [Heart, 'Favorit'],
];
export default function Slotly() {
  const [page, setPage] = useState('Jelajahi');
  const [category, setCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<AppData>({
    venues,
    user: null,
    bookings: [],
    favorites: [],
    notifications: [],
    isAdmin: false,
    managedVenues: [],
    transactions: [],
    commission: 5,
    reviewed: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Venue | null>(null);
  const [date, setDate] = useState('');
  const [area, setArea] = useState('all');
  const [sort, setSort] = useState('recommended');
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [maxDistance, setMaxDistance] = useState('all');
  const [info, setInfo] = useState('');
  const [saving, setSaving] = useState<string[]>([]);
  const refresh = useCallback(async () => {
    try {
      setData(await api<AppData>());
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(refresh);
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, [refresh]);
  const favorite = async (v: Venue) => {
    if (!data.user) {
      setInfo('Masuk');
      return;
    }
    setSaving((p) => [...p, v.id]);
    try {
      await api({
        action: 'favorite',
        venueId: v.id,
        saved: !data.favorites.includes(v.id),
      });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving((p) => p.filter((id) => id !== v.id));
    }
  };
  const reset = () => {
    setCategory('Semua');
    setSearch('');
    setArea('all');
    setMaxPrice('all');
    setMinRating('all');
    setMaxDistance('all');
  };
  const navigate = (name: string) => {
    setPage(name);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.replaceState(
      {},
      '',
      name === 'Jelajahi'
        ? '/dashboard'
        : '/dashboard?view=' + encodeURIComponent(name),
    );
  };
  useEffect(() => {
    if (loading) return;
    const requested = new URLSearchParams(window.location.search).get('view');
    const publicPages = ['Jelajahi', 'Booking Saya', 'Favorit'];
    if (requested && publicPages.includes(requested)) {
      queueMicrotask(() => setPage(requested));
      return;
    }
    if (requested === 'Admin Platform' && data.isAdmin) {
      queueMicrotask(() => setPage(requested));
      return;
    }
    if (requested || (page === 'Admin Platform' && !data.isAdmin)) {
      window.history.replaceState({}, '', '/dashboard');
      queueMicrotask(() => setPage('Jelajahi'));
    }
  }, [data.isAdmin, loading, page]);
  const filtered = data.venues
    .filter(
      (v) =>
        (page !== 'Favorit' || data.favorites.includes(v.id)) &&
        (category === 'Semua' || v.category === category) &&
        (v.name + ' ' + v.area + ' ' + v.category)
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (area === 'all' || v.area === area) &&
        (maxPrice === 'all' || v.price <= Number(maxPrice)) &&
        (minRating === 'all' || v.rating >= Number(minRating)) &&
        (maxDistance === 'all' || v.distance <= Number(maxDistance)),
    )
    .sort((a, b) =>
      sort === 'price'
        ? a.price - b.price
        : sort === 'rating'
          ? b.rating - a.rating
          : sort === 'distance'
            ? a.distance - b.distance
            : 0,
    );
  const initials = data.user?.name[0]?.toUpperCase() ?? 'S';
  useEffect(() => {
    type Tool = {
      name: string;
      description: string;
      inputSchema: object;
      annotations: object;
      execute: (input: unknown) => unknown;
    };
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (tool: Tool, options: { signal: AbortSignal }) => void;
        };
      }
    ).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      context.registerTool(
        {
          name: 'search_slotly_venues',
          description: 'Cari venue dan tampilkan hasil pencarian di Slotly.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              category: { type: 'string', enum: categories },
            },
            required: ['query'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: true },
          execute(input) {
            const v = input as { query: unknown; category?: unknown };
            if (
              typeof v.query !== 'string' ||
              v.query.length > 100 ||
              (v.category !== undefined &&
                (typeof v.category !== 'string' ||
                  !categories.includes(v.category)))
            )
              throw new Error('Pencarian tidak valid');
            setSearch(v.query);
            setCategory(typeof v.category === 'string' ? v.category : 'Semua');
            setPage('Jelajahi');
            return { query: v.query, category: v.category ?? 'Semua' };
          },
        },
        { signal: lifecycle.signal },
      );
    } catch {}
    return () => lifecycle.abort();
  }, []);

  return (
    <SidebarProvider
      style={{ '--sidebar-width': '242px' } as React.CSSProperties}
    >
      <Sidebar className="app-sidebar">
        <SidebarHeader>
          <Link className="brand" href="/">
            <SlotlyLogo className="w-[145px]" priority />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <p className="nav-label">TEMUKAN PENGALAMAN</p>
          <nav>
            {navigation.map(([Icon, label]) => (
              <button
                key={label}
                onClick={() => navigate(label)}
                className={`nav-item ${page === label ? 'active' : ''}`}
              >
                <Icon size={20} />
                {label}
                {label === 'Jelajahi' && <span className="active-dot" />}
              </button>
            ))}
          </nav>
          {data.isAdmin && (
            <>
              <p className="nav-label second">ADMINISTRASI</p>
              <nav>
                <button
                  onClick={() => navigate('Admin Platform')}
                  className={`nav-item ${page === 'Admin Platform' ? 'active' : ''}`}
                >
                  <ShieldCheck size={20} />
                  Admin Platform
                </button>
              </nav>
            </>
          )}
        </SidebarContent>
        <SidebarFooter>
          <button className="nav-item" onClick={() => setInfo('Bantuan')}>
            <CircleHelp size={20} />
            Pusat Bantuan
            <ArrowUpRight size={15} />
          </button>
          <button className="profile" onClick={() => setInfo('Akun')}>
            <span className="avatar">{initials}</span>
            <div>
              <strong>{data.user?.name ?? 'Selamat datang'}</strong>
              <small>{data.user ? 'Akun personal' : 'Masuk ke Slotly'}</small>
            </div>
            <ChevronDown size={16} />
          </button>
        </SidebarFooter>
      </Sidebar>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <SidebarTrigger className="mobile-menu" />
            <span>Temukan tempat</span>
            <span>/</span>
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <button className="location" onClick={() => setInfo('Lokasi')}>
              <MapPin size={17} /> Jakarta Selatan <ChevronDown size={14} />
            </button>
            <span className="top-divider" />
            <button
              aria-label="Notifikasi"
              className="bell"
              onClick={() => setInfo('Notifikasi')}
            >
              <Bell size={20} />
              {data.notifications.length > 0 && <i />}
            </button>
            <button
              className="avatar small"
              aria-label="Akun saya"
              onClick={() => setInfo('Akun')}
            >
              {initials}
            </button>
          </div>
        </header>
        <main className="main-content">
          {error && (
            <div role="alert" className="error-message">
              {error} <button onClick={refresh}>Coba lagi</button>
            </div>
          )}
          {(page === 'Jelajahi' || page === 'Favorit') && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">SEDIKIT JEDA, BANYAK CERITA</p>
                  <h1>
                    {page === 'Favorit'
                      ? 'Tempat favoritmu'
                      : 'Waktu luang, jadi pengalaman'}
                    <span>.</span>
                  </h1>
                  <p>Temukan dan booking tempat favoritmu. Sesimpel itu.</p>
                </div>
                <span className="heading-note">
                  <span className="green-dot" /> Ada waktu? Ada Slotly.
                </span>
              </div>
              {page === 'Jelajahi' && (
                <section className="hero">
                  <div className="hero-photo" />
                  <div className="hero-content">
                    <span className="hero-badge">
                      <Sparkles size={14} /> WAKTUNYA COBA HAL BARU
                    </span>
                    <h2>
                      Rencana seru dimulai
                      <br />
                      dari satu slot.
                    </h2>
                    <p>
                      Dari rally pertama sampai me-time favorit.
                      <br />
                      Tempat terbaik untuk setiap rencanamu.
                    </p>
                    <button
                      className="primary"
                      onClick={() => {
                        setCategory('Olahraga');
                        document
                          .getElementById('explore')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Temukan tempatmu <ArrowUpRight size={18} />
                    </button>
                    <div className="hero-proof">
                      <span className="mini-avatars">
                        <b>A</b>
                        <b>D</b>
                        <b>S</b>
                        <b>R</b>
                      </span>
                      <span>
                        <span className="stars">★★★★★</span>
                        <small>Lebih banyak momen, lebih sedikit repot.</small>
                      </span>
                    </div>
                  </div>
                  <span className="photo-caption">
                    <MapPin size={14} /> Your next favorite place
                  </span>
                  <div className="hero-pagination" aria-hidden="true">
                    <b />
                    <i />
                    <i />
                  </div>
                </section>
              )}
              <form
                className="search-panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  document
                    .getElementById('explore')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <label className="search-field">
                  <Search size={22} />
                  <span>
                    <small>MAU KE MANA?</small>
                    <input
                      aria-label="Cari tempat atau aktivitas"
                      placeholder="Cari tempat atau aktivitas..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </span>
                </label>
                <div className="search-place">
                  <MapPin size={20} />
                  <span>
                    <small>LOKASI</small>
                    <Choice
                      label="Area pencarian"
                      value={area}
                      onChange={setArea}
                      options={[
                        { value: 'all', label: 'Jakarta Selatan' },
                        ...Array.from(
                          new Set(data.venues.map((v) => v.area)),
                        ).map((a) => ({ value: a, label: a })),
                      ]}
                    />
                  </span>
                </div>
                <label className="search-date">
                  <CalendarDays size={20} />
                  <span>
                    <small>TANGGAL</small>
                    <input
                      aria-label="Tanggal kunjungan"
                      type="date"
                      min={today()}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </span>
                </label>
                <button className="primary search-button" type="submit">
                  <Search size={18} />
                  Cari tempat
                </button>
              </form>
              <section className="category-row">
                {categories.map((c, i) => {
                  const Icon = icons[i];
                  return (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`category ${category === c ? 'selected' : ''}`}
                    >
                      <Icon size={20} />
                      {c}
                    </button>
                  );
                })}
              </section>
              <section id="explore">
                <div className="section-heading">
                  <div>
                    <h2>
                      {category === 'Semua'
                        ? 'Tempat pilihan di sekitarmu'
                        : category}
                      <span className="count-label">
                        {filtered.length} tempat
                      </span>
                    </h2>
                    <p>
                      Tempat bagus, waktu yang pas. Pilih yang paling kamu suka.
                    </p>
                  </div>
                  <div className="result-actions">
                    <button
                      className="outline"
                      onClick={() => setFilterOpen(true)}
                    >
                      <SlidersHorizontal size={16} />
                      Filter
                      {[maxPrice, minRating, maxDistance].some(
                        (x) => x !== 'all',
                      ) && <span className="green-dot" />}
                    </button>
                    <Choice
                      label="Urutkan tempat"
                      value={sort}
                      onChange={setSort}
                      options={[
                        { value: 'recommended', label: 'Rekomendasi' },
                        { value: 'price', label: 'Harga terendah' },
                        { value: 'rating', label: 'Rating tertinggi' },
                        { value: 'distance', label: 'Jarak terdekat' },
                      ]}
                    />
                  </div>
                </div>
                <div className="venue-grid">
                  {filtered.map((v) => (
                    <article className="venue-card" key={v.id}>
                      <div
                        className={`venue-image image-${v.id}`}
                        style={{ backgroundImage: `url(${v.image})` }}
                      >
                        {v.tag && (
                          <span className="venue-tag">
                            {v.tag === 'Paling populer' && <span>✦</span>}
                            {v.tag}
                          </span>
                        )}
                        <button
                          className={`favorite-button ${data.favorites.includes(v.id) ? 'saved' : ''}`}
                          disabled={saving.includes(v.id)}
                          onClick={() => favorite(v)}
                          aria-pressed={data.favorites.includes(v.id)}
                          aria-label={`Simpan ${v.name}`}
                        >
                          <Heart
                            size={19}
                            fill={
                              data.favorites.includes(v.id)
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                        <span className="available">
                          <span />
                          Cek jadwal
                        </span>
                      </div>
                      <div className="venue-info">
                        <div className="venue-meta">
                          <span>{v.category}</span>
                          <span className="rating">
                            <Star size={13} fill="currentColor" />
                            {v.rating}
                            <small>({v.reviews})</small>
                          </span>
                        </div>
                        <h3>
                          <button onClick={() => setSelected(v)}>
                            {v.name}
                          </button>
                        </h3>
                        <p className="venue-location">
                          <MapPin size={14} />
                          {v.area}, {v.city}
                          <span>· {v.distance} km</span>
                        </p>
                        <div className="venue-bottom">
                          <div>
                            <small>Mulai dari</small>
                            <p>
                              <strong>{money(v.price)}</strong>
                              <span> / jam</span>
                            </p>
                          </div>
                          <button
                            className="card-arrow"
                            onClick={() => setSelected(v)}
                            aria-label={`Lihat ${v.name}`}
                          >
                            <ArrowUpRight size={19} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="empty-state">
                    <Search size={32} />
                    <h3>Belum ada tempat yang cocok</h3>
                    <p>Coba kata kunci atau kategori lain.</p>
                    <button className="outline" onClick={reset}>
                      Reset pencarian
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
          {page === 'Booking Saya' && (
            <BookingHistory
              bookings={data.bookings}
              allVenues={data.venues}
              refresh={refresh}
              explore={() => navigate('Jelajahi')}
              reviewed={data.reviewed ?? []}
            />
          )}
          {page === 'Admin Platform' && data.isAdmin && (
            <AdminDashboard
              refresh={refresh}
              managedVenues={data.managedVenues ?? []}
              transactions={data.transactions ?? []}
              commission={data.commission ?? 5}
            />
          )}
          <footer className="page-footer">
            <span>© 2026 Slotly. Buat waktu untuk hal yang kamu suka.</span>
            <span>
              <ShieldCheck size={15} /> Reservasi mudah, rencana lebih pasti.
            </span>
          </footer>
          <p className="catalog-note">
            {loading
              ? 'Menghubungkan ke Slotly…'
              : 'Mode demo · Venue, foto, rating, dan jarak awal merupakan contoh. Tidak ada pembayaran riil.'}
          </p>
        </main>
      </div>
      {selected && (
        <BookingFlow
          venue={selected}
          initialDate={date}
          signedIn={!!data.user}
          onClose={() => setSelected(null)}
          onBooked={() => {
            void refresh();
            navigate('Booking Saya');
          }}
        />
      )}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="standard-dialog">
          <DialogTitle>Tempat yang pas buatmu</DialogTitle>
          <DialogDescription>
            Sesuaikan pencarian dengan rencana dan budget.
          </DialogDescription>
          <label className="field-label">
            Harga maksimal per jam
            <Choice
              label="Harga maksimal"
              value={maxPrice}
              onChange={setMaxPrice}
              options={[
                { value: 'all', label: 'Semua harga' },
                ...[75000, 100000, 150000, 200000].map((v) => ({
                  value: String(v),
                  label: money(v),
                })),
              ]}
            />
          </label>
          <label className="field-label">
            Rating minimal
            <Choice
              label="Rating minimal"
              value={minRating}
              onChange={setMinRating}
              options={[
                { value: 'all', label: 'Semua rating' },
                { value: '4.8', label: '4,8 ke atas' },
                { value: '4.9', label: '4,9 ke atas' },
              ]}
            />
          </label>
          <label className="field-label">
            Radius dari Kemang
            <Choice
              label="Radius pencarian"
              value={maxDistance}
              onChange={setMaxDistance}
              options={[
                { value: 'all', label: 'Semua jarak' },
                { value: '3', label: '3 km' },
                { value: '5', label: '5 km' },
              ]}
            />
          </label>
          <p className="fine-print">
            Jarak adalah data contoh dari Kemang, bukan lokasi GPS perangkat.
          </p>
          <div className="dialog-actions">
            <button className="outline" onClick={reset}>
              Reset
            </button>
            <button className="primary" onClick={() => setFilterOpen(false)}>
              Tampilkan {filtered.length} tempat
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <InfoDialog
        info={info}
        setInfo={setInfo}
        user={data.user}
        notifications={data.notifications}
        areas={Array.from(new Set(data.venues.map((v) => v.area)))}
        area={area}
        onArea={(v) => {
          setArea(v);
          setInfo('');
          navigate('Jelajahi');
        }}
      />
    </SidebarProvider>
  );
}
