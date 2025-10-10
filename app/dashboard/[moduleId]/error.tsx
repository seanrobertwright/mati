'use client';

import { useEffect } from 'react';

export default function ModuleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Module error:', error);
  }, [error]);

  return (
    <div className="bg-white rounded-lg border border-red-200 p-8">
      <h1 className="text-2xl font-bold text-red-900 mb-2">Module Error</h1>
      <p className="text-gray-600 mb-4">
        Something went wrong loading this module. This might be a temporary issue.
      </p>
      <div className="space-y-2">
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2"
        >
          Back to Dashboard
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
}