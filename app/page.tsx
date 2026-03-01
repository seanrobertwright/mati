// Temporarily disabled redirect for debugging
// import { redirect } from 'next/navigation';

export default function Home() {
  // redirect('/dashboard');
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <p className="mt-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</a>
        </p>
      </div>
    </div>
  );
}
