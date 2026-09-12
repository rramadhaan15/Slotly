import { redirect } from 'next/navigation';
import Slotly from '@/components/slotly';
import { getSlotlyUser } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getSlotlyUser();
  if (!user) redirect('/signin');

  return <Slotly />;
}
