'use client';

import { CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react';

export interface GenerateResult {
  siswa_nis: string;
  status: 'completed' | 'failed' | 'processing';
  pdf_url?: string;
  error_message?: string;
  history_id?: string;
}

interface GenerateProgressProps {
  results: GenerateResult[];
  isGenerating?: boolean;
  onDownload?: (pdfUrl: string, siswa_nis: string) => void;
}

export default function GenerateProgress({
  results,
  isGenerating = false,
  onDownload,
}: GenerateProgressProps) {
  const total = results.length;
  const completed = results.filter((r) => r.status === 'completed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const processing = results.filter((r) => r.status === 'processing').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleDownload = (pdfUrl: string, siswa_nis: string) => {
    if (onDownload) {
      onDownload(pdfUrl, siswa_nis);
    } else {
      // Default download behavior
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {isGenerating ? 'Generating Rapor...' : 'Hasil Generate'}
        </h2>
        {isGenerating && (
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        )}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {completed} dari {total} rapor selesai di-generate
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-blue-600">{total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Berhasil</p>
          <p className="text-2xl font-bold text-green-600">{completed}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Gagal</p>
          <p className="text-2xl font-bold text-red-600">{failed}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Proses</p>
          <p className="text-2xl font-bold text-yellow-600">{processing}</p>
        </div>
      </div>

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Detail Per Siswa
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${
                  result.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {result.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : result.status === 'failed' ? (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-yellow-600 animate-spin flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">
                        NIS: {result.siswa_nis}
                      </p>
                      {result.status === 'completed' && (
                        <p className="text-sm text-green-600">
                          ✓ Rapor berhasil di-generate
                        </p>
                      )}
                      {result.status === 'failed' && result.error_message && (
                        <p className="text-sm text-red-600 break-words">
                          {result.error_message}
                        </p>
                      )}
                      {result.status === 'processing' && (
                        <p className="text-sm text-yellow-600">
                          Sedang memproses...
                        </p>
                      )}
                    </div>
                  </div>
                  {result.status === 'completed' && result.pdf_url && (
                    <button
                      onClick={() => handleDownload(result.pdf_url!, result.siswa_nis)}
                      className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !isGenerating && (
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada hasil generate</p>
        </div>
      )}

      {/* Download All Button (for completed results) */}
      {completed > 0 && !isGenerating && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              results
                .filter((r) => r.status === 'completed' && r.pdf_url)
                .forEach((r) => {
                  setTimeout(() => {
                    window.open(r.pdf_url, '_blank');
                  }, 500);
                });
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Semua ({completed} file)
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Akan membuka {completed} tab baru untuk download
          </p>
        </div>
      )}
    </div>
  );
}
