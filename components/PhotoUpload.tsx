'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload } from 'lucide-react';

interface PhotoUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
}

export default function PhotoUpload({ 
  value, 
  onChange 
}: PhotoUploadProps) {
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  // Update preview when value changes (for edit mode)
  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validasi
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB');
      return;
    }

    // Set file dan preview
    onChange(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayPhoto = preview;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Foto Profile
      </label>
      
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-10 h-10 text-white" />
            )}
          </div>
          
          {displayPhoto && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              title="Hapus foto"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">
              {displayPhoto ? 'Ganti Foto' : 'Upload Foto'}
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, atau GIF. Maksimal 2MB.
          </p>
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
