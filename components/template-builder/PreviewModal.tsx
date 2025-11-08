'use client';

import { useState, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import { DataBindingSchemaType } from '@/types/rapor-builder';
import PDFPreviewRenderer from '@/lib/rapor/pdf-preview-renderer';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateConfig: any;
  elements: any[];
}

export default function PreviewModal({
  isOpen,
  onClose,
  templateId,
  templateConfig,
  elements,
}: PreviewModalProps) {
  const toast = useToast();
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');
  const [tahunAjaran, setTahunAjaran] = useState<string>('');
  const [semester, setSemester] = useState<number>(1);
  const [previewData, setPreviewData] = useState<DataBindingSchemaType | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  // Load students list
  useEffect(() => {
    if (isOpen) {
      loadStudents();
      // Set default periode to current academic year
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const defaultTahunAjaran = currentMonth >= 7 
        ? `${currentYear}/${currentYear + 1}` 
        : `${currentYear - 1}/${currentYear}`;
      const defaultSemester = currentMonth >= 7 && currentMonth <= 12 ? 1 : 2;
      
      setTahunAjaran(defaultTahunAjaran);
      setSemester(defaultSemester);
    }
  }, [isOpen]);

  // Load preview data when periode changes
  useEffect(() => {
    if (isOpen && tahunAjaran && semester) {
      loadPreviewData();
    }
  }, [isOpen, selectedSiswaId, tahunAjaran, semester]);

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/siswa/list');
      const result = await response.json();
      
      if (result.success) {
        setStudents(result.data || []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadPreviewData = async () => {
    setIsLoadingData(true);
    setError('');
    
    try {
      const response = await fetch('/api/rapor/data/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: selectedSiswaId || undefined,
          periode: {
            tahun_ajaran: tahunAjaran,
            semester: semester,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPreviewData(result.data);
        toast.success('Data preview berhasil dimuat');
      } else {
        const errorMsg = result.error || 'Gagal memuat data preview';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error loading preview data:', error);
      const errorMsg = 'Terjadi kesalahan saat memuat data preview';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewData) return;

    setIsGeneratingPDF(true);
    try {
      // Generate PDF blob
      const pdfBlob = await PDFPreviewRenderer.generatePDFBlob(
        templateConfig,
        elements,
        previewData
      );

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Preview_${templateConfig.name}_${previewData.siswa.nama}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMsg = 'Gagal menghasilkan PDF';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Preview Template</h2>
            <p className="text-sm text-gray-600 mt-1">
              {templateConfig.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Student Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Siswa (Opsional)
              </label>
              <select
                value={selectedSiswaId}
                onChange={(e) => setSelectedSiswaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Data Sample</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nama_siswa || student.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Tahun Ajaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun Ajaran
              </label>
              <input
                type="text"
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                placeholder="2024/2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
            </div>

            {/* Download Button */}
            <div className="flex items-end">
              <button
                onClick={handleDownloadPDF}
                disabled={!previewData || isGeneratingPDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-500 mt-3">
            {selectedSiswaId
              ? 'Preview menggunakan data real dari siswa yang dipilih'
              : 'Preview menggunakan data sample. Pilih siswa untuk melihat data real.'}
          </p>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">Memuat data preview...</p>
                <p className="text-sm text-gray-500">Mengambil data siswa dan habit tracker</p>
              </div>
            </div>
          ) : previewData ? (
            <div className="bg-white rounded-lg shadow-lg mx-auto" style={{ width: '210mm' }}>
              <PDFPreviewRenderer
                templateConfig={templateConfig}
                elements={elements}
                data={previewData}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Pilih periode untuk melihat preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
