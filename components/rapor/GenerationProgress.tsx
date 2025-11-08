'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Download, Loader2, Package } from 'lucide-react';

export interface GenerationStatus {
  siswaId: string;
  siswaName: string;
  siswa_nis: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pdfUrl?: string;
  error?: string;
}

export interface BulkJobStatus {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: {
    total: number;
    completed: number;
    failed: number;
    current?: string;
  };
  results: GenerationStatus[];
}

interface GenerationProgressProps {
  jobId?: string;
  results: GenerationStatus[];
  isGenerating: boolean;
  onRefresh?: () => void;
}

export default function GenerationProgress({
  jobId,
  results,
  isGenerating,
  onRefresh,
}: GenerationProgressProps) {
  const [autoRefresh, setAutoRefresh] = useState(isGenerating);

  // Auto-refresh when generating
  useEffect(() => {
    if (isGenerating && onRefresh) {
      const interval = setInterval(() => {
        onRefresh();
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isGenerating, onRefresh]);

  const total = results.length;
  const completed = results.filter((r) => r.status === 'completed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const processing = results.filter((r) => r.status === 'processing').length;
  const pending = results.filter((r) => r.status === 'pending').length;
  
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleDownload = (pdfUrl: string, siswaName: string) => {
    window.open(pdfUrl, '_blank');
  };

  const handleDownloadAll = () => {
    const completedResults = results.filter((r) => r.status === 'completed' && r.pdfUrl);
    
    if (completedResults.length === 0) {
      alert('Tidak ada rapor yang berhasil di-generate');
      return;
    }

    // Download each PDF with a small delay
    completedResults.forEach((result, index) => {
      setTimeout(() => {
        window.open(result.pdfUrl, '_blank');
      }, index * 500);
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin shrink-0" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400 shrink-0" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Berhasil di-generate';
      case 'failed':
        return 'Gagal';
      case 'processing':
        return 'Sedang memproses...';
      case 'pending':
        return 'Menunggu...';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {isGenerating ? 'Generating Rapor...' : 'Hasil Generate Rapor'}
        </h2>
        {isGenerating && (
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        )}
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {completed} dari {total} rapor selesai di-generate
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-blue-600">{total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-gray-600 mb-1">Berhasil</p>
          <p className="text-2xl font-bold text-green-600">{completed}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-gray-600 mb-1">Gagal</p>
          <p className="text-2xl font-bold text-red-600">{failed}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-gray-600 mb-1">Proses</p>
          <p className="text-2xl font-bold text-yellow-600">{processing}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-600">{pending}</p>
        </div>
      </div>

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Detail Per Siswa
            </h3>
            {onRefresh && isGenerating && (
              <button
                onClick={onRefresh}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Refresh
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {result.siswaName || `NIS: ${result.siswa_nis}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        NIS: {result.siswa_nis}
                      </p>
                      <p className={`text-sm mt-1 ${
                        result.status === 'completed' ? 'text-green-600' :
                        result.status === 'failed' ? 'text-red-600' :
                        result.status === 'processing' ? 'text-yellow-600' :
                        'text-gray-500'
                      }`}>
                        {getStatusText(result.status)}
                      </p>
                      {result.status === 'failed' && result.error && (
                        <p className="text-xs text-red-600 mt-1 wrap-break-word">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                  {result.status === 'completed' && result.pdfUrl && (
                    <button
                      onClick={() => handleDownload(result.pdfUrl!, result.siswaName)}
                      className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shrink-0"
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
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Belum ada hasil generate</p>
        </div>
      )}

      {/* Download All Button */}
      {completed > 0 && !isGenerating && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleDownloadAll}
            className="w-full px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Semua ({completed} file)
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Akan membuka {completed} tab baru untuk download
          </p>
        </div>
      )}

      {/* Job ID Display (for debugging) */}
      {jobId && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Job ID: <code className="bg-gray-100 px-2 py-1 rounded">{jobId}</code>
          </p>
        </div>
      )}
    </div>
  );
}
