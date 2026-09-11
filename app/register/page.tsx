import { redirect } from 'next/navigation';
import { getSlotlyUser } from '@/lib/auth';
import RegisterPage from '@/components/register-page';

export default async function Register() {
  const user = await getSlotlyUser();
  if (user) redirect('/dashboard');
  return <RegisterPage />;
}
