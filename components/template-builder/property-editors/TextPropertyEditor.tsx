'use client';

import { TextElement } from '@/types/rapor-builder';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface TextPropertyEditorProps {
  element: TextElement;
  onChange: (updates: Partial<TextElement>) => void;
}

export default function TextPropertyEditor({
  element,
  onChange,
}: TextPropertyEditorProps) {
  return (
    <div className="space-y-6">
      {/* Content Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Content</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Text Content
              <span className="text-gray-400 ml-1">(supports placeholders like {'{{siswa.nama}}'})</span>
            </label>
            <textarea
              value={element.content.text}
              onChange={(e) =>
                onChange({
                  content: { ...element.content, text: e.target.value },
                })
              }
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter text content..."
            />
          </div>
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
              <option value="Tahoma">Tahoma</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                max="72"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
              <select
                value={element.style.fontWeight}
                onChange={(e) =>
                  onChange({
                    style: { ...element.style, fontWeight: e.target.value as any },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="100">Thin (100)</option>
                <option value="200">Extra Light (200)</option>
                <option value="300">Light (300)</option>
                <option value="normal">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="bold">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Line Height</label>
            <input
              type="range"
              value={element.style.lineHeight}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, lineHeight: Number(e.target.value) },
                })
              }
              min="1"
              max="3"
              step="0.1"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1.0</span>
              <span className="font-medium text-gray-700">{element.style.lineHeight.toFixed(1)}</span>
              <span>3.0</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Letter Spacing</label>
            <input
              type="number"
              value={element.style.letterSpacing || 0}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, letterSpacing: Number(e.target.value) },
                })
              }
              step="0.1"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Colors</h4>
        <div className="space-y-3">
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

          <div>
            <label className="block text-xs text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              value={element.style.backgroundColor || '#ffffff'}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, backgroundColor: e.target.value },
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
          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
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
              {align === 'justify' && <AlignJustify className="w-4 h-4 mx-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Border & Padding Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Border & Padding</h4>
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

          <div>
            <label className="block text-xs text-gray-600 mb-2">Padding</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  value={element.style.padding?.top || 0}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        padding: {
                          top: Number(e.target.value),
                          right: element.style.padding?.right || 0,
                          bottom: element.style.padding?.bottom || 0,
                          left: element.style.padding?.left || 0,
                        },
                      },
                    })
                  }
                  placeholder="Top"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={element.style.padding?.right || 0}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        padding: {
                          top: element.style.padding?.top || 0,
                          right: Number(e.target.value),
                          bottom: element.style.padding?.bottom || 0,
                          left: element.style.padding?.left || 0,
                        },
                      },
                    })
                  }
                  placeholder="Right"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={element.style.padding?.bottom || 0}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        padding: {
                          top: element.style.padding?.top || 0,
                          right: element.style.padding?.right || 0,
                          bottom: Number(e.target.value),
                          left: element.style.padding?.left || 0,
                        },
                      },
                    })
                  }
                  placeholder="Bottom"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={element.style.padding?.left || 0}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        padding: {
                          top: element.style.padding?.top || 0,
                          right: element.style.padding?.right || 0,
                          bottom: element.style.padding?.bottom || 0,
                          left: Number(e.target.value),
                        },
                      },
                    })
                  }
                  placeholder="Left"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
