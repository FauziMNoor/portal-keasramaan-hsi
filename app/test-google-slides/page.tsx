'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestGoogleSlidesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-google-slides');
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        message: 'Error: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Test Google Slides API
        </h1>
        <p className="text-gray-600 mb-8">
          Klik tombol di bawah untuk test koneksi ke Google Slides API
        </p>

        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Connection'
          )}
        </button>

        {result && (
          <div
            className={`mt-6 p-6 rounded-xl ${
              result.success
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-bold text-lg mb-2 ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.message}
                </h3>

                {result.success && result.data && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Presentation Title:</span>
                      <span className="font-semibold text-gray-800">
                        {result.data.presentationTitle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slide Count:</span>
                      <span className="font-semibold text-gray-800">
                        {result.data.slideCount} slides
                      </span>
                    </div>
                  </div>
                )}

                {!result.success && result.error && (
                  <div className="mt-3 p-3 bg-red-100 rounded-lg">
                    <p className="text-xs text-red-700 font-mono break-all">
                      {result.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-2">
            Environment Variables Check:
          </h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>
              ✓ GOOGLE_SLIDES_TEMPLATE_ID:{' '}
              <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_GOOGLE_SLIDES_TEMPLATE_ID ? '✓ Set' : '✗ Not Set'}
              </code>
            </li>
            <li>
              ✓ GOOGLE_SERVICE_ACCOUNT_EMAIL:{' '}
              <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ Set' : '✗ Not Set'}
              </code>
            </li>
            <li>
              ✓ GOOGLE_PRIVATE_KEY:{' '}
              <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY ? '✓ Set' : '✗ Not Set'}
              </code>
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Note: Environment variables tanpa NEXT_PUBLIC_ prefix tidak bisa diakses di client-side.
            Test akan dilakukan di server-side (API route).
          </p>
        </div>
      </div>
    </div>
  );
}
