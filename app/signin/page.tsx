import { redirect } from 'next/navigation';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import SignInPage from '@/components/sign-in-page';

export default async function SignIn() {
  const user = await getChatGPTUser();
  if (user) redirect('/dashboard');

  return <SignInPage />;
}
