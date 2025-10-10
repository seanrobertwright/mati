import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In - Safety Management',
  description: 'Sign in to your safety management account',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm redirectTo={params.redirectTo} />;
}

