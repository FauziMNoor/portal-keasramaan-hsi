'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import GenerateProgress, { GenerateResult } from '@/components/rapor/GenerateProgress';
import StudentFilter, { StudentFilterValue } from '@/components/rapor/StudentFilter';
import PeriodeSelector, { PeriodeValue } from '@/components/rapor/PeriodeSelector';
import GenerationProgress, { GenerationStatus, BulkJobStatus } from '@/components/rapor/GenerationProgress';
import GenerateRaporSkeleton from '@/components/rapor/GenerateRaporSkeleton';

interface Template {
  id: string;
  nama_template: string;
  jenis_rapor: string;
  ukuran_kertas_default: string;
  orientasi_default: string;
  template_type?: 'legacy' | 'builder';
}

export default function GenerateRaporPage() {
  const router = useRouter();
  const toast = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // Student filter state
  const [studentFilter, setStudentFilter] = useState<StudentFilterValue>({
    mode: 'single',
    singleNIS: '',
    bulkNISList: [],
  });
  
  // Periode state
  const [periode, setPeriode] = useState<PeriodeValue>({
    tahunAjaran: '',
    semester: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Legacy results (for backward compatibility)
  const [legacyResults, setLegacyResults] = useState<GenerateResult[]>([]);
  const [showLegacyResults, setShowLegacyResults] = useState(false);
  
  // Builder results
  const [builderResults, setBuilderResults] = useState<GenerationStatus[]>([]);
  const [showBuilderResults, setShowBuilderResults] = useState(false);
  const [bulkJobId, setBulkJobId] = useState<string | null>(null);
  
  // Confirmation dialog state
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rapor/template?is_active=true');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (!selectedTemplate) {
      toast.warning('Pilih template terlebih dahulu');
      return;
    }

    if (!periode.tahunAjaran || !periode.semester) {
      toast.warning('Pilih tahun ajaran dan semester');
      return;
    }

    if (studentFilter.mode === 'single' && !studentFilter.singleNIS?.trim()) {
      toast.warning('Masukkan NIS siswa');
      return;
    }

    if (studentFilter.mode === 'bulk' && (!studentFilter.bulkNISList || studentFilter.bulkNISList.length === 0)) {
      toast.warning('Masukkan daftar NIS siswa');
      return;
    }

    const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
    const isBuilderTemplate = selectedTemplateData?.template_type === 'builder';

    // Show confirmation dialog
    const studentCount = studentFilter.mode === 'single' ? 1 : studentFilter.bulkNISList?.length || 0;
    
    const message =
      studentFilter.mode === 'single'
        ? `Generate rapor untuk siswa dengan NIS ${studentFilter.singleNIS}?`
        : `Generate rapor untuk ${studentCount} siswa? Proses ini mungkin memakan waktu beberapa menit.`;

    setConfirmMessage(message);
    setShowGenerateConfirm(true);
  };

  const confirmGenerate = async () => {
    setShowGenerateConfirm(false);

    const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
    const isBuilderTemplate = selectedTemplateData?.template_type === 'builder';

    setGenerating(true);
    setShowLegacyResults(false);
    setShowBuilderResults(false);
    setLegacyResults([]);
    setBuilderResults([]);
    setBulkJobId(null);

    try {
      if (isBuilderTemplate) {
        // Builder template generation
        await handleBuilderGenerate();
      } else {
        // Legacy template generation
        await handleLegacyGenerate();
      }
    } catch (error: any) {
      console.error('Generate error:', error);
      toast.error('Terjadi kesalahan: ' + error.message);
      setGenerating(false);
    }
  };

  const handleLegacyGenerate = async () => {
    try {
      if (studentFilter.mode === 'single') {
        // Single generate
        const res = await fetch('/api/rapor/generate/single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template_id: selectedTemplate,
            siswa_nis: studentFilter.singleNIS?.trim(),
            tahun_ajaran: periode.tahunAjaran,
            semester: periode.semester,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setLegacyResults([
            {
              siswa_nis: studentFilter.singleNIS?.trim() || '',
              status: 'completed',
              pdf_url: data.data.pdf_url,
            },
          ]);
          setShowLegacyResults(true);
          toast.success('Rapor berhasil di-generate!');
        } else {
          setLegacyResults([
            {
              siswa_nis: studentFilter.singleNIS?.trim() || '',
              status: 'failed',
              error_message: data.error || 'Unknown error',
            },
          ]);
          setShowLegacyResults(true);
          toast.error('Gagal generate rapor: ' + data.error);
        }
      } else {
        // Bulk generate
        const res = await fetch('/api/rapor/generate/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template_id: selectedTemplate,
            siswa_nis_list: studentFilter.bulkNISList,
            tahun_ajaran: periode.tahunAjaran,
            semester: periode.semester,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setLegacyResults(data.data.results || []);
          setShowLegacyResults(true);
          toast.success(
            `Bulk generate selesai! ${data.data.completed} berhasil, ${data.data.failed} gagal`
          );
        } else {
          toast.error('Gagal bulk generate: ' + data.error);
        }
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleBuilderGenerate = async () => {
    try {
      if (studentFilter.mode === 'single') {
        // Single generate for builder template
        const res = await fetch('/api/rapor/generate/builder/single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: selectedTemplate,
            siswaId: studentFilter.singleNIS?.trim(),
            periode: {
              tahun_ajaran: periode.tahunAjaran,
              semester: parseInt(periode.semester),
            },
          }),
        });

        const data = await res.json();

        if (data.success) {
          setBuilderResults([
            {
              siswaId: data.data.siswaId || '',
              siswaName: data.data.siswaName || '',
              siswa_nis: studentFilter.singleNIS?.trim() || '',
              status: 'completed',
              pdfUrl: data.data.pdfUrl,
            },
          ]);
          setShowBuilderResults(true);
          toast.success('Rapor berhasil di-generate!');
        } else {
          setBuilderResults([
            {
              siswaId: '',
              siswaName: '',
              siswa_nis: studentFilter.singleNIS?.trim() || '',
              status: 'failed',
              error: data.error || 'Unknown error',
            },
          ]);
          setShowBuilderResults(true);
          toast.error('Gagal generate rapor: ' + data.error);
        }
      } else {
        // Bulk generate for builder template
        const res = await fetch('/api/rapor/generate/builder/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: selectedTemplate,
            siswaIds: studentFilter.bulkNISList,
            periode: {
              tahun_ajaran: periode.tahunAjaran,
              semester: parseInt(periode.semester),
            },
          }),
        });

        const data = await res.json();

        if (data.success) {
          setBulkJobId(data.data.jobId);
          // Initialize results with pending status
          const initialResults: GenerationStatus[] = (studentFilter.bulkNISList || []).map((nis) => ({
            siswaId: '',
            siswaName: '',
            siswa_nis: nis,
            status: 'pending',
          }));
          setBuilderResults(initialResults);
          setShowBuilderResults(true);
          toast.info('Bulk generate dimulai. Mohon tunggu...');
          
          // Start polling for status
          pollBulkStatus(data.data.jobId);
        } else {
          toast.error('Gagal memulai bulk generate: ' + data.error);
          setGenerating(false);
        }
      }
    } catch (error) {
      setGenerating(false);
      throw error;
    }
  };

  const pollBulkStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rapor/generate/builder/bulk/${jobId}/status`);
        const data = await res.json();

        if (data.success) {
          const jobStatus: BulkJobStatus = data.data;
          setBuilderResults(jobStatus.results);

          if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
            clearInterval(pollInterval);
            setGenerating(false);
            
            const completed = jobStatus.progress.completed;
            const failed = jobStatus.progress.failed;
            
            if (failed === 0) {
              toast.success(`Bulk generate selesai! ${completed} rapor berhasil dibuat`);
            } else if (completed === 0) {
              toast.error(`Bulk generate gagal! Semua ${failed} rapor gagal dibuat`);
            } else {
              toast.warning(`Bulk generate selesai dengan ${completed} berhasil dan ${failed} gagal`);
            }
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
  const isBuilderTemplate = selectedTemplateData?.template_type === 'builder';

  // Show skeleton while loading templates
  if (loading) {
    return <GenerateRaporSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Generate Rapor</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">Generate rapor PDF untuk siswa</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
        {/* Template Selection */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
            Pilih Template <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            disabled={loading || generating}
          >
            <option value="">-- Pilih Template --</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.nama_template} ({template.jenis_rapor})
                {template.template_type === 'builder' && ' [Builder]'}
              </option>
            ))}
          </select>
          {selectedTemplateData && (
            <div className="mt-2 p-2 sm:p-3 bg-blue-50 rounded-lg text-xs sm:text-sm text-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span><strong>Jenis:</strong> {selectedTemplateData.jenis_rapor}</span>
                <span className="hidden sm:inline">|</span>
                <span><strong>Tipe:</strong> {isBuilderTemplate ? 'Builder' : 'Legacy'}</span>
                <span className="hidden sm:inline">|</span>
                <span><strong>Ukuran:</strong> {selectedTemplateData.ukuran_kertas_default}</span>
                <span className="hidden sm:inline">|</span>
                <span><strong>Orientasi:</strong> {selectedTemplateData.orientasi_default}</span>
              </div>
            </div>
          )}
        </div>

        {/* Periode Selection */}
        <div className="mb-4 sm:mb-6">
          <PeriodeSelector
            value={periode}
            onChange={setPeriode}
            showBulan={selectedTemplateData?.jenis_rapor === 'bulanan'}
            disabled={generating}
          />
        </div>

        {/* Student Filter */}
        <div className="mb-4 sm:mb-6">
          <StudentFilter
            value={studentFilter}
            onChange={setStudentFilter}
            disabled={generating}
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              generating ||
              !selectedTemplate ||
              !periode.tahunAjaran ||
              !periode.semester ||
              (studentFilter.mode === 'single' && !studentFilter.singleNIS?.trim()) ||
              (studentFilter.mode === 'bulk' && (!studentFilter.bulkNISList || studentFilter.bulkNISList.length === 0))
            }
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-smooth shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation focus-ring hover-lift"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="hidden sm:inline">Sedang Generate...</span>
                <span className="sm:hidden">Proses...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Generate Rapor</span>
                <span className="sm:hidden">Generate</span>
              </>
            )}
          </button>
        </div>

        {/* Generating Status Message */}
        {generating && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in-up">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-900">
                  Sedang memproses generate rapor...
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {studentFilter.mode === 'single' 
                    ? 'Mohon tunggu, PDF sedang dibuat'
                    : `Memproses ${studentFilter.bulkNISList?.length || 0} siswa. Ini mungkin memakan waktu beberapa menit.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legacy Results Section */}
      {showLegacyResults && legacyResults.length > 0 && (
        <GenerateProgress results={legacyResults} isGenerating={generating} />
      )}

      {/* Builder Results Section */}
      {showBuilderResults && builderResults.length > 0 && (
        <GenerationProgress
          jobId={bulkJobId || undefined}
          results={builderResults}
          isGenerating={generating}
          onRefresh={bulkJobId ? () => pollBulkStatus(bulkJobId) : undefined}
        />
      )}

      {/* Generate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showGenerateConfirm}
        title="Konfirmasi Generate Rapor"
        message={confirmMessage}
        confirmText="Generate"
        cancelText="Batal"
        confirmVariant="primary"
        onConfirm={confirmGenerate}
        onCancel={() => setShowGenerateConfirm(false)}
      />
    </div>
  );
}
