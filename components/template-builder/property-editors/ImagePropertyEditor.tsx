'use client';

import { ImageElement } from '@/types/rapor-builder';
import { Upload } from 'lucide-react';

interface ImagePropertyEditorProps {
  element: ImageElement;
  onChange: (updates: Partial<ImageElement>) => void;
}

export default function ImagePropertyEditor({
  element,
  onChange,
}: ImagePropertyEditorProps) {
  return (
    <div className="space-y-6">
      {/* Image Source Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Image Source</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Source Type</label>
            <select
              value={element.content.source}
              onChange={(e) =>
                onChange({
                  content: {
                    ...element.content,
                    source: e.target.value as 'upload' | 'url' | 'binding',
                  },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="url">URL</option>
              <option value="upload">Upload</option>
              <option value="binding">Data Binding</option>
            </select>
          </div>

          {element.content.source === 'upload' && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Upload Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Click to upload image</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // TODO: Implement file upload to Supabase Storage
                      console.log('File selected:', file);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {(element.content.source === 'url' || element.content.source === 'binding') && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                {element.content.source === 'binding' ? 'Data Binding' : 'Image URL'}
              </label>
              <input
                type="text"
                value={element.content.value}
                onChange={(e) =>
                  onChange({
                    content: { ...element.content, value: e.target.value },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  element.content.source === 'binding'
                    ? '{{siswa.foto_url}}'
                    : 'https://example.com/image.jpg'
                }
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-600 mb-1">Alt Text (optional)</label>
            <input
              type="text"
              value={element.content.alt || ''}
              onChange={(e) =>
                onChange({
                  content: { ...element.content, alt: e.target.value },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Image description"
            />
          </div>
        </div>
      </div>

      {/* Image Fit Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Image Fit</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Fit Mode</label>
            <select
              value={element.content.fit}
              onChange={(e) =>
                onChange({
                  content: {
                    ...element.content,
                    fit: e.target.value as 'cover' | 'contain' | 'fill' | 'none',
                  },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cover">Cover (crop to fill)</option>
              <option value="contain">Contain (fit within bounds)</option>
              <option value="fill">Fill (stretch to fit)</option>
              <option value="none">None (original size)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {element.content.fit === 'cover' &&
                'Image will be cropped to fill the entire area'}
              {element.content.fit === 'contain' &&
                'Image will be scaled to fit within the area'}
              {element.content.fit === 'fill' &&
                'Image will be stretched to fill the area'}
              {element.content.fit === 'none' && 'Image will maintain its original size'}
            </p>
          </div>
        </div>
      </div>

      {/* Border Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Border</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Border Color</label>
            <input
              type="color"
              value={element.style.borderColor || '#000000'}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, borderColor: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Border Width</label>
              <input
                type="number"
                value={element.style.borderWidth || 0}
                onChange={(e) =>
                  onChange({
                    style: { ...element.style, borderWidth: Number(e.target.value) },
                  })
                }
                min="0"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Border Radius</label>
              <input
                type="number"
                value={element.style.borderRadius || 0}
                onChange={(e) =>
                  onChange({
                    style: { ...element.style, borderRadius: Number(e.target.value) },
                  })
                }
                min="0"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Opacity Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Opacity</h4>
        <div className="space-y-3">
          <div>
            <input
              type="range"
              value={(element.style.opacity || 1) * 100}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, opacity: Number(e.target.value) / 100 },
                })
              }
              min="0"
              max="100"
              step="1"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="font-medium text-gray-700">
                {Math.round((element.style.opacity || 1) * 100)}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {element.content.value && element.content.source !== 'binding' && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
            <img
              src={element.content.value}
              alt={element.content.alt || 'Preview'}
              className="w-full h-auto rounded"
              style={{
                objectFit: element.content.fit,
                opacity: element.style.opacity || 1,
                borderRadius: `${element.style.borderRadius || 0}px`,
                border: element.style.borderWidth
                  ? `${element.style.borderWidth}px solid ${element.style.borderColor}`
                  : 'none',
              }}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
