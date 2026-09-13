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
  Mail,
  MapPin,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';
import styles from './sign-in-page.module.css';
import { SlotlyLogo } from './slotly-logo';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setError('Konfirmasi password belum sama.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Pendaftaran gagal.');
      window.location.assign('/dashboard');
    } catch (problem) {
      setError((problem as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/signin">
        <ArrowLeft size={17} /> Kembali ke halaman masuk
      </Link>
      <section className={`${styles.card} ${styles.registerCard}`}>
        <div className={styles.storyPanel}>
          <Image
            src="/images/studio.jpg"
            alt="Studio kreatif pilihan Slotly"
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
              <Sparkles size={14} /> Mulai dari satu slot.
            </span>
            <h1>Buat akun, buat lebih banyak cerita.</h1>
            <p>
              Satu akun untuk menemukan tempat, menyimpan favorit, dan menjaga
              semua rencanamu tetap rapi.
            </p>
          </div>
          <div className={styles.locationCard}>
            <span>
              <MapPin size={15} /> Tempat pilihan di sekitarmu
            </span>
            <strong>
              <Star size={14} fill="currentColor" /> Mudah dan cepat
            </strong>
          </div>
        </div>
        <div className={styles.formPanel}>
          <div className={styles.mobileBrand}>
            <SlotlyLogo className={styles.mobileLogo} priority />
          </div>
          <div className={styles.formContent}>
            <div className={styles.heading}>
              <span>GABUNG DENGAN SLOTLY</span>
              <h2>Buat akun baru</h2>
              <p>Isi data berikut untuk mulai menyusun rencana favoritmu.</p>
            </div>
            <form
              className={`${styles.authForm} ${styles.registerForm}`}
              onSubmit={submit}
            >
              <label>
                <span>Username</span>
                <span className={styles.inputWrap}>
                  <UserRound size={17} />
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Nama pengguna"
                    autoComplete="username"
                    required
                    minLength={3}
                    maxLength={40}
                  />
                </span>
              </label>
              <label>
                <span>Email</span>
                <span className={styles.inputWrap}>
                  <Mail size={17} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </span>
              </label>
              <label>
                <span>Password</span>
                <span className={styles.inputWrap}>
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    required
                    minLength={8}
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
              <label>
                <span>Konfirmasi password</span>
                <span className={styles.inputWrap}>
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                  />
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
                  <UserRound size={18} />
                )}
                {loading ? 'Membuat akun...' : 'Daftar dengan email'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
            <div className={styles.loginPrompt}>
              <span>Sudah punya akun?</span>
              <Link href="/signin">Masuk di sini</Link>
            </div>
          </div>
          <p className={styles.terms}>
            Password dienkripsi. Jangan gunakan password yang sama dengan
            layanan lain.
          </p>
        </div>
      </section>
    </main>
  );
}
