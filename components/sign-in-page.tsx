import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  LockKeyhole,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react';
import styles from './sign-in-page.module.css';

function ChatGPTMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.28 9.82a5.55 5.55 0 0 0-4.66-5.35A5.56 5.56 0 0 0 8.2 2.52a5.55 5.55 0 0 0-5.52 7.3 5.56 5.56 0 0 0 .62 9.4 5.55 5.55 0 0 0 8.8 2.05 5.56 5.56 0 0 0 8.8-4.05 5.55 5.55 0 0 0 1.38-7.4Zm-10.17 10a4.06 4.06 0 0 1-2.6-.94l.13-.08 4.3-2.48a.72.72 0 0 0 .36-.62V9.65l1.82 1.05v5a.73.73 0 0 1-.36.63l-3.65 2.1v1.39Zm-7.56-1.87a4.08 4.08 0 0 1-1.3-2.44l.13.08 4.3 2.49a.73.73 0 0 0 .72 0l5.24-3.03v2.1L9.3 19.66a.73.73 0 0 1-.72 0l-4.03-2.32v.6Zm-.97-8.17a4.08 4.08 0 0 1 1.3-2.44v5.06c0 .26.14.5.36.63l5.24 3.02-1.82 1.05-4.34-2.5a.73.73 0 0 1-.36-.63V9.78h-.38Zm14.87 3.17-5.24-3.03 1.82-1.05 4.34 2.5c.22.13.36.37.36.63v4.2a4.07 4.07 0 0 1-1.3 2.44v-5.06a.72.72 0 0 0-.36-.63h.38Zm1.79-4.46-.13-.08-4.3-2.49a.72.72 0 0 0-.72 0L9.75 8.95v-2.1l4.34-2.5a.73.73 0 0 1 .72 0l3.64 2.1a4.07 4.07 0 0 1 1.79 2.04ZM9.1 14.35l-1.82-1.06v-5a.73.73 0 0 1 .36-.63l3.65-2.1a4.06 4.06 0 0 1 2.6.94l-.13.08-4.3 2.48a.72.72 0 0 0-.36.63v4.66Zm.98-3.53L12 9.72l1.92 1.1v2.22L12 14.15l-1.92-1.11v-2.22Z"
      />
    </svg>
  );
}

export default function SignInPage() {
  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/">
        <ArrowLeft size={17} /> Kembali ke beranda
      </Link>

      <section className={styles.card}>
        <div className={styles.storyPanel}>
          <Image
            src="/images/padel.jpg"
            alt="Lapangan padel yang tersedia di Slotly"
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            priority
          />
          <div className={styles.overlay} />
          <Link className={styles.brand} href="/">
            <span><CalendarDays size={21} /></span>
            slotly<i>.</i>
          </Link>

          <div className={styles.storyCopy}>
            <span className={styles.eyebrow}>
              <Sparkles size={14} /> Ada waktu? Ada Slotly.
            </span>
            <h1>Lebih banyak momen, lebih sedikit repot.</h1>
            <p>
              Simpan tempat favorit, kelola reservasi, dan temukan slot terbaik
              untuk setiap rencanamu.
            </p>
          </div>

          <div className={styles.locationCard}>
            <span><MapPin size={15} /> Jakarta Selatan</span>
            <strong><Star size={14} fill="currentColor" /> 4.9 pilihan komunitas</strong>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.mobileBrand}>
            <span><CalendarDays size={20} /></span>
            slotly<i>.</i>
          </div>

          <div className={styles.formContent}>
            <span className={styles.welcomeIcon}><CalendarDays size={22} /></span>
            <div className={styles.heading}>
              <span>SELAMAT DATANG</span>
              <h2>Masuk ke Slotly</h2>
              <p>Lanjutkan untuk menyimpan favorit dan mengelola semua reservasi.</p>
            </div>

            <Link
              className={styles.authButton}
              href="/signin-with-chatgpt?return_to=%2Fdashboard"
            >
              <ChatGPTMark />
              Lanjutkan dengan ChatGPT
              <ArrowRight size={18} />
            </Link>

            <div className={styles.divider}>
              <span />
              <small>SATU AKUN UNTUK SEMUA RENCANA</small>
              <span />
            </div>

            <ul className={styles.benefits}>
              <li><BadgeCheck size={18} /><span><strong>Reservasi tersimpan</strong><small>Cek dan atur jadwalmu kapan saja.</small></span></li>
              <li><BadgeCheck size={18} /><span><strong>Favorit selalu dekat</strong><small>Simpan tempat yang ingin kamu kunjungi lagi.</small></span></li>
              <li><BadgeCheck size={18} /><span><strong>Akses merchant</strong><small>Kelola venue dan booking dari dashboard yang sama.</small></span></li>
            </ul>

            <p className={styles.security}>
              <LockKeyhole size={14} /> Slotly tidak menyimpan kata sandi ChatGPT Anda.
            </p>
          </div>

          <p className={styles.terms}>
            Dengan melanjutkan, Anda menyetujui ketentuan penggunaan dan kebijakan privasi Slotly.
          </p>
        </div>
      </section>
    </main>
  );
}
