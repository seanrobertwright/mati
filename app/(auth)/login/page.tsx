import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In - Safety Management',
  description: 'Sign in to your safety management account',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  return <LoginForm redirectTo={searchParams.redirectTo} />;
}

