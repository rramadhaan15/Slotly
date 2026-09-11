'use client';

import { useState, type SyntheticEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, Eye, EyeOff, Loader2, LockKeyhole, Mail, MapPin, Sparkles, Star } from 'lucide-react';
import styles from './sign-in-page.module.css';

export default function SignInPage() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      <Link className={styles.back} href="/"><ArrowLeft size={17} /> Kembali ke beranda</Link>
      <section className={styles.card}>
        <div className={styles.storyPanel}>
          <Image src="/images/padel.jpg" alt="Lapangan padel yang tersedia di Slotly" fill sizes="(max-width: 760px) 100vw, 50vw" priority />
          <div className={styles.overlay} />
          <Link className={styles.brand} href="/"><span><CalendarDays size={21} /></span>slotly<i>.</i></Link>
          <div className={styles.storyCopy}>
            <span className={styles.eyebrow}><Sparkles size={14} /> Ada waktu? Ada Slotly.</span>
            <h1>Lebih banyak momen, lebih sedikit repot.</h1>
            <p>Simpan tempat favorit, kelola reservasi, dan temukan slot terbaik untuk setiap rencanamu.</p>
          </div>
          <div className={styles.locationCard}>
            <span><MapPin size={15} /> Jakarta Selatan</span>
            <strong><Star size={14} fill="currentColor" /> 4.9 pilihan komunitas</strong>
          </div>
        </div>
        <div className={styles.formPanel}>
          <div className={styles.mobileBrand}><span><CalendarDays size={20} /></span>slotly<i>.</i></div>
          <div className={styles.formContent}>
            <span className={styles.welcomeIcon}><CalendarDays size={22} /></span>
            <div className={styles.heading}>
              <span>SELAMAT DATANG KEMBALI</span>
              <h2>Masuk ke Slotly</h2>
              <p>Masukkan akunmu untuk melihat favorit dan seluruh reservasi.</p>
            </div>
            <form className={styles.authForm} onSubmit={submit}>
              <label>
                <span>Email atau username</span>
                <span className={styles.inputWrap}>
                  <Mail size={17} />
                  <input type="text" value={identity} onChange={(event) => setIdentity(event.target.value)} placeholder="nama@email.com" autoComplete="username" required maxLength={254} />
                </span>
              </label>
              <label>
                <span className={styles.labelRow}><span>Password</span><button type="button" onClick={() => setError('Fitur reset password segera tersedia.')}>Lupa password?</button></span>
                <span className={styles.inputWrap}>
                  <LockKeyhole size={17} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" autoComplete="current-password" required maxLength={128} />
                  <button className={styles.eyeButton} type="button" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </span>
              </label>
              {error && <p className={styles.formError} role="alert">{error}</p>}
              <button className={styles.authButton} type="submit" disabled={loading}>
                {loading ? <Loader2 className={styles.spinner} size={19} /> : <Mail size={18} />}
                {loading ? 'Memeriksa akun...' : 'Lanjutkan dengan email'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
            <div className={styles.registerPrompt}>
              <span>Belum punya akun?</span>
              <Link href="/register">Daftar di sini <ArrowRight size={16} /></Link>
            </div>
            <p className={styles.security}><LockKeyhole size={14} /> Password dilindungi dan tidak pernah disimpan sebagai teks biasa.</p>
          </div>
          <p className={styles.terms}>Dengan melanjutkan, Anda menyetujui ketentuan penggunaan dan kebijakan privasi Slotly.</p>
        </div>
      </section>
    </main>
  );
}
