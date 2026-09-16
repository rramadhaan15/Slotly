'use client';

import { useState, type SyntheticEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react';
import styles from './sign-in-page.module.css';
import { SlotlyLogo } from './slotly-logo';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function SignInPage({
  initialError = '',
}: {
  initialError?: string;
}) {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Proses masuk gagal.');
      window.location.assign('/dashboard');
    } catch (problem) {
      setError((problem as Error).message);
      setLoading(false);
    }
  }

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
          <Link className={styles.brand} href="/" aria-label="Slotly beranda">
            <SlotlyLogo className={styles.authLogo} framed priority />
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
            <span>
              <MapPin size={15} /> Seluruh Jakarta
            </span>
            <strong>
              <Star size={14} fill="currentColor" /> 4.9 pilihan komunitas
            </strong>
          </div>
        </div>
        <div className={styles.formPanel}>
          <div className={styles.mobileBrand}>
            <SlotlyLogo className={styles.mobileLogo} priority />
          </div>
          <div className={styles.formContent}>
            <SlotlyLogo className={styles.welcomeLogo} />
            <div className={styles.heading}>
              <span>SELAMAT DATANG KEMBALI</span>
              <h2>Masuk ke Slotly</h2>
              <p>
                Masukkan akunmu untuk melihat favorit dan seluruh reservasi.
              </p>
            </div>
            <form className={styles.authForm} onSubmit={submit}>
              <label>
                <span>Email atau username</span>
                <span className={styles.inputWrap}>
                  <Mail size={17} />
                  <input
                    type="text"
                    value={identity}
                    onChange={(event) => setIdentity(event.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="username"
                    required
                    maxLength={254}
                  />
                </span>
              </label>
              <label>
                <span className={styles.labelRow}>
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() =>
                      setError('Fitur reset password segera tersedia.')
                    }
                  >
                    Lupa password?
                  </button>
                </span>
                <span className={styles.inputWrap}>
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                    maxLength={128}
                  />
                  <button
                    className={styles.eyeButton}
                    type="button"
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
              {error && (
                <p className={styles.formError} role="alert">
                  {error}
                </p>
              )}
              <button
                className={styles.authButton}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className={styles.spinner} size={19} />
                ) : (
                  <LogIn size={18} />
                )}
                {loading ? 'Memeriksa akun...' : 'Masuk'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className={styles.orDivider}>
              <span />
              <small>ATAU</small>
              <span />
            </div>
            {/* oxlint-disable-next-line next/no-html-link-for-pages -- OAuth harus memakai navigasi dokumen penuh. */}
            <a className={styles.googleButton} href="/api/auth/google">
              <GoogleIcon />
              Lanjutkan dengan Gmail
              <ArrowRight size={18} />
            </a>
            <div className={styles.registerPrompt}>
              <span>Belum punya akun?</span>
              <Link href="/register">
                Daftar di sini <ArrowRight size={16} />
              </Link>
            </div>
            <p className={styles.security}>
              <LockKeyhole size={14} /> Password dilindungi dan tidak pernah
              disimpan sebagai teks biasa.
            </p>
          </div>
          <p className={styles.terms}>
            Dengan melanjutkan, Anda menyetujui ketentuan penggunaan dan
            kebijakan privasi Slotly.
          </p>
        </div>
      </section>
    </main>
  );
}
