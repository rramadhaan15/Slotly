import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Users,
} from 'lucide-react';
import styles from './landing-page.module.css';
import { Footer } from './ui/modem-animated-footer';

const venues = [
  {
    name: 'The Padel Club',
    category: 'Olahraga',
    area: 'Kemang',
    price: 'Rp150.000',
    rating: '4.9',
    image: '/images/padel.jpg',
  },
  {
    name: 'Kala Barbershop',
    category: 'Perawatan',
    area: 'Cipete',
    price: 'Rp85.000',
    rating: '4.8',
    image: '/images/barber.jpg',
  },
  {
    name: 'Ruang Cerita Studio',
    category: 'Studio',
    area: 'Bangka',
    price: 'Rp200.000',
    rating: '4.9',
    image: '/images/studio.jpg',
  },
];

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Temukan tempat',
    text: 'Cari venue sesuai aktivitas, lokasi, dan waktu yang kamu punya.',
  },
  {
    icon: CalendarCheck,
    number: '02',
    title: 'Pilih slot terbaik',
    text: 'Lihat ketersediaan jadwal dan harga secara transparan.',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Datang dan nikmati',
    text: 'Reservasi tercatat rapi. Kamu tinggal hadir dan menikmati waktu.',
  },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Slotly beranda">
          <span className={styles.brandIcon}>
            <CalendarDays size={22} />
          </span>
          <span>slotly<span>.</span></span>
        </Link>

        <nav className={styles.nav} aria-label="Navigasi utama">
          <a href="#pilihan">Tempat pilihan</a>
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#partner">Untuk merchant</a>
        </nav>

        <div className={styles.headerActions}>
          <Link className={styles.signIn} href="/signin">Masuk</Link>
          <Link className={styles.headerCta} href="/signin">
            Jelajahi tempat <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroCopy}>
            <span className={styles.pill}>
              <Sparkles size={14} /> Sedikit jeda, banyak cerita
            </span>
            <h1>
              Waktu luang, jadi
              <br />
              <span>pengalaman.</span>
            </h1>
            <p>
              Temukan lapangan, salon, studio, dan tempat favorit di sekitarmu.
              Pilih jadwalnya, reservasi dengan mudah, lalu nikmati waktumu.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} href="/signin">
                Temukan tempatmu <ArrowRight size={18} />
              </Link>
              <a className={styles.secondaryCta} href="#cara-kerja">
                Lihat cara kerja <ChevronRight size={17} />
              </a>
            </div>
            <div className={styles.proof}>
              <span className={styles.avatars} aria-hidden="true">
                <i>A</i><i>D</i><i>S</i><i>R</i>
              </span>
              <span>
                <strong><Star size={13} fill="currentColor" /> 4.9</strong>
                <small>Dipercaya pencari waktu berkualitas</small>
              </span>
            </div>
          </div>

          <div className={styles.imageFan} aria-label="Pilihan pengalaman di Slotly">
            <figure className={`${styles.fanCard} ${styles.leftCard}`}>
              <Image src="/images/salon.jpg" alt="Interior salon pilihan Slotly" fill sizes="280px" priority />
              <figcaption>Me-time favorit</figcaption>
            </figure>
            <figure className={`${styles.fanCard} ${styles.centerCard}`}>
              <Image src="/images/padel.jpg" alt="Lapangan padel pilihan Slotly" fill sizes="340px" priority />
              <figcaption><MapPin size={14} /> Kemang, Jakarta Selatan</figcaption>
            </figure>
            <figure className={`${styles.fanCard} ${styles.rightCard}`}>
              <Image src="/images/music.jpg" alt="Studio musik pilihan Slotly" fill sizes="280px" priority />
              <figcaption>Ruang untuk berkarya</figcaption>
            </figure>
            <span className={styles.availableBadge}>
              <span /> Tersedia hari ini
            </span>
          </div>
        </section>

        <section className={styles.trustBar} aria-label="Keunggulan Slotly">
          <span><BadgeCheck size={18} /> Venue terkurasi</span>
          <span><Clock3 size={18} /> Jadwal real-time</span>
          <span><ShieldCheck size={18} /> Reservasi lebih pasti</span>
          <span><Users size={18} /> Untuk setiap rencana</span>
        </section>

        <section className={styles.venueSection} id="pilihan">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>TEMPAT PILIHAN SLOTLY</span>
              <h2>Tempat bagus, waktu yang pas.</h2>
              <p>Mulai dari aktivitas favorit sampai pengalaman baru.</p>
            </div>
            <Link href="/signin" className={styles.textLink}>
              Lihat semua tempat <ArrowRight size={17} />
            </Link>
          </div>

          <div className={styles.venueGrid}>
            {venues.map((venue) => (
              <Link href="/signin" className={styles.venueCard} key={venue.name}>
                <div className={styles.venueImage}>
                  <Image src={venue.image} alt={venue.name} fill sizes="(max-width: 760px) 100vw, 33vw" />
                  <span className={styles.category}>{venue.category}</span>
                  <span className={styles.rating}><Star size={13} fill="currentColor" /> {venue.rating}</span>
                </div>
                <div className={styles.venueInfo}>
                  <div>
                    <h3>{venue.name}</h3>
                    <p><MapPin size={14} /> {venue.area}, Jakarta Selatan</p>
                  </div>
                  <span>Mulai <strong>{venue.price}</strong> / jam</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.howSection} id="cara-kerja">
          <div className={styles.howIntro}>
            <span className={styles.kicker}>SEMUDAH ITU</span>
            <h2>Rencana seru dimulai dari satu slot.</h2>
            <p>Tiga langkah sederhana untuk mengubah waktu luang menjadi momen yang berarti.</p>
            <Link className={styles.primaryCta} href="/signin">
              Mulai jelajahi <ArrowRight size={18} />
            </Link>
          </div>
          <div className={styles.steps}>
            {steps.map(({ icon: Icon, number, title, text }) => (
              <article className={styles.step} key={number}>
                <span className={styles.stepIcon}><Icon size={22} /></span>
                <span className={styles.stepNumber}>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.partnerSection} id="partner">
          <div className={styles.partnerVisual}>
            <Image src="/images/badminton.jpg" alt="Venue partner Slotly" fill sizes="480px" />
            <span><Store size={18} /> Partner bertumbuh bersama Slotly</span>
          </div>
          <div className={styles.partnerCopy}>
            <span className={styles.kicker}>RUANG USAHA</span>
            <h2>Punya tempat usaha? Biar setiap slot lebih berarti.</h2>
            <p>
              Atur jadwal, terima reservasi, dan jangkau lebih banyak pelanggan
              dalam satu dashboard yang sederhana.
            </p>
            <ul>
              <li><BadgeCheck size={18} /> Kelola ketersediaan dengan mudah</li>
              <li><BadgeCheck size={18} /> Pantau booking dalam satu tempat</li>
              <li><BadgeCheck size={18} /> Hadir di depan pelanggan yang tepat</li>
            </ul>
            <Link className={styles.partnerCta} href="/dashboard?view=Dashboard%20Merchant">
              Jadi partner Slotly <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer
        brandName="slotly"
        brandDescription="Temukan tempat, pilih waktu terbaik, dan buat setiap rencana jadi lebih mudah bersama Slotly."
        navLinks={[
          { label: 'Tempat pilihan', href: '#pilihan' },
          { label: 'Cara kerja', href: '#cara-kerja' },
          { label: 'Untuk merchant', href: '#partner' },
          { label: 'Masuk', href: '/signin' },
        ]}
        brandIcon={<CalendarDays className="size-8 text-white sm:size-10 md:size-14" />}
        copyrightText="Seluruh hak cipta dilindungi."
      />
    </div>
  );
}
