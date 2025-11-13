'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';
import { 
  validateCatatanPerilakuPhoto, 
  generatePreviewUrl,
  CATATAN_PERILAKU_UPLOAD_CONFIG 
} from '@/lib/uploadCatatanPerilaku';

interface MultiPhotoUploadProps {
  value: string[]; // Array of preview URLs
  onChange: (files: File[], previews: string[]) => void;
  maxPhotos?: number;
  maxSizePerPhoto?: number; // in MB
  disabled?: boolean;
}

export default function MultiPhotoUpload({
  value = [],
  onChange,
  maxPhotos = CATATAN_PERILAKU_UPLOAD_CONFIG.MAX_PHOTOS,
  maxSizePerPhoto = CATATAN_PERILAKU_UPLOAD_CONFIG.MAX_FILE_SIZE_MB,
  disabled = false,
}: MultiPhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>(value);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviews(value);
  }, [value]);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError('');

    // Check if adding these files would exceed max photos
    const totalPhotos = previews.length + selectedFiles.length;
    if (totalPhotos > maxPhotos) {
      setError(`Maksimal ${maxPhotos} foto. Anda sudah memiliki ${previews.length} foto.`);
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Validate file
      const validationError = validateCatatanPerilakuPhoto(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      // Generate preview
      try {
        const previewUrl = await generatePreviewUrl(file);
        newFiles.push(file);
        newPreviews.push(previewUrl);
      } catch (err) {
        console.error('Error generating preview:', err);
        setError('Gagal membuat preview foto');
      }
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      const updatedPreviews = [...previews, ...newPreviews];
      
      setFiles(updatedFiles);
      setPreviews(updatedPreviews);
      onChange(updatedFiles, updatedPreviews);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onChange(updatedFiles, updatedPreviews);
    setError('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled && previews.length < maxPhotos) {
      fileInputRef.current?.click();
    }
  };

  const canAddMore = previews.length < maxPhotos;

  return (
    <div className="space-y-3">
      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Photos */}
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group"
          >
            <img
              src={preview}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Add Photo Button */}
        {canAddMore && !disabled && (
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              aspect-square rounded-xl border-2 border-dashed cursor-pointer
              flex flex-col items-center justify-center gap-2
              transition-all
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            <div className="text-gray-400">
              {isDragging ? (
                <Upload className="w-8 h-8" />
              ) : (
                <Camera className="w-8 h-8" />
              )}
            </div>
            <p className="text-xs text-gray-500 text-center px-2">
              {isDragging ? 'Drop di sini' : 'Tambah Foto'}
            </p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Info & Error */}
      <div className="space-y-2">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-500 mt-0.5">⚠️</div>
            <p className="text-sm text-red-700 flex-1">{error}</p>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <ImageIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 space-y-1">
            <p>
              <span className="font-semibold">Foto: {previews.length}/{maxPhotos}</span>
              {canAddMore && ` • Bisa tambah ${maxPhotos - previews.length} lagi`}
            </p>
            <p className="text-blue-600">
              Max {maxSizePerPhoto}MB per foto • JPG, PNG, GIF, WebP
            </p>
            <p className="text-blue-600">
              📁 Drag & drop atau click untuk upload
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
