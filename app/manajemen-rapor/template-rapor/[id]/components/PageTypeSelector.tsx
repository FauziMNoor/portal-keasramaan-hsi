'use client';

import { Image, Table, Images, QrCode, X } from 'lucide-react';

interface PageTypeSelectorProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

const pageTypes = [
  {
    type: 'static_cover',
    label: 'Cover Statis',
    description: 'Halaman cover dengan gambar dan overlay data siswa',
    icon: Image,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  {
    type: 'dynamic_data',
    label: 'Data Dinamis',
    description: 'Halaman dengan data capaian indikator siswa',
    icon: Table,
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
  {
    type: 'galeri_kegiatan',
    label: 'Galeri Kegiatan',
    description: 'Halaman dengan foto-foto kegiatan',
    icon: Images,
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  },
  {
    type: 'qr_code',
    label: 'QR Code',
    description: 'Halaman dengan QR code untuk akses galeri online',
    icon: QrCode,
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  },
];

export default function PageTypeSelector({ onSelect, onClose }: PageTypeSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Pilih Tipe Halaman</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pageTypes.map((pageType) => {
              const Icon = pageType.icon;
              return (
                <button
                  key={pageType.type}
                  onClick={() => onSelect(pageType.type)}
                  className={`p-6 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all text-left ${pageType.color}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{pageType.label}</h3>
                      <p className="text-sm opacity-80">{pageType.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
