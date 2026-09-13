import { redirect } from 'next/navigation';
import { getSlotlyUser } from '@/lib/auth';
import SignInPage from '@/components/sign-in-page';

const errors: Record<string, string> = {
  google_not_configured: 'Login Gmail belum dikonfigurasi oleh administrator.',
  google_cancelled: 'Proses masuk dengan Gmail dibatalkan atau kedaluwarsa.',
  google_account_not_found:
    'Akun dengan email tersebut belum tersedia. Silakan daftar terlebih dahulu.',
  google_failed: 'Login Gmail belum berhasil. Silakan coba kembali.',
};

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSlotlyUser();
  if (user) redirect('/dashboard');

  const code = (await searchParams).error ?? '';
  return <SignInPage initialError={errors[code] ?? ''} />;
}
