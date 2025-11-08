'use client';

import { SignatureElement } from '@/types/rapor-builder';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface SignaturePropertyEditorProps {
  element: SignatureElement;
  onChange: (updates: Partial<SignatureElement>) => void;
}

export default function SignaturePropertyEditor({
  element,
  onChange,
}: SignaturePropertyEditorProps) {
  return (
    <div className="space-y-6">
      {/* Content Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Content</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Label</label>
            <input
              type="text"
              value={element.content.label}
              onChange={(e) =>
                onChange({
                  content: { ...element.content, label: e.target.value },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Pembina Asrama, Kepala Sekolah"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Name
              <span className="text-gray-400 ml-1">
                (supports placeholders like {'{{pembina.nama}}'})
              </span>
            </label>
            <input
              type="text"
              value={element.content.name || ''}
              onChange={(e) =>
                onChange({
                  content: { ...element.content, name: e.target.value },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter name or use {{binding}}"
            />
          </div>
        </div>
      </div>

      {/* Display Options Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Display Options</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.content.showLine}
              onChange={(e) =>
                onChange({
                  content: { ...element.content, showLine: e.target.checked },
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show Signature Line</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.content.showDate}
              onChange={(e) =>
                onChange({
                  content: { ...element.content, showDate: e.target.checked },
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show Date</span>
          </label>
        </div>
      </div>

      {/* Typography Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Typography</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Family</label>
            <select
              value={element.style.fontFamily}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, fontFamily: e.target.value },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Size</label>
            <input
              type="number"
              value={element.style.fontSize}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, fontSize: Number(e.target.value) },
                })
              }
              min="8"
              max="32"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Color</label>
            <input
              type="color"
              value={element.style.color}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, color: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Alignment Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Text Alignment</h4>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() =>
                onChange({
                  style: { ...element.style, textAlign: align },
                })
              }
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                element.style.textAlign === align
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {align === 'left' && <AlignLeft className="w-4 h-4 mx-auto" />}
              {align === 'center' && <AlignCenter className="w-4 h-4 mx-auto" />}
              {align === 'right' && <AlignRight className="w-4 h-4 mx-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Line Style Section */}
      {element.content.showLine && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Signature Line Style</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Line Color</label>
              <input
                type="color"
                value={element.style.lineColor || '#000000'}
                onChange={(e) =>
                  onChange({
                    style: { ...element.style, lineColor: e.target.value },
                  })
                }
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Line Width</label>
              <input
                type="number"
                value={element.style.lineWidth || 1}
                onChange={(e) =>
                  onChange({
                    style: { ...element.style, lineWidth: Number(e.target.value) },
                  })
                }
                min="1"
                max="5"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div
            style={{
              textAlign: element.style.textAlign,
              fontFamily: element.style.fontFamily,
              fontSize: `${element.style.fontSize}px`,
              color: element.style.color,
            }}
          >
            <div className="mb-2">{element.content.label}</div>
            {element.content.showLine && (
              <div
                style={{
                  borderTop: `${element.style.lineWidth || 1}px solid ${
                    element.style.lineColor || '#000000'
                  }`,
                  margin: '20px 0',
                }}
              />
            )}
            {element.content.name && (
              <div className="font-semibold">{element.content.name}</div>
            )}
            {element.content.showDate && (
              <div className="text-sm mt-1 opacity-70">
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
