'use client';

export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variable Test</h1>
      <div className="space-y-2 font-mono text-sm">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
          {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT DEFINED'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ DEFINED' : '❌ NOT DEFINED'}
        </div>
      </div>
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm">
          If you see ❌ NOT DEFINED above, restart your dev server:
        </p>
        <code className="block mt-2 text-xs bg-black text-white p-2 rounded">
          npm run dev
        </code>
      </div>
    </div>
  );
}

