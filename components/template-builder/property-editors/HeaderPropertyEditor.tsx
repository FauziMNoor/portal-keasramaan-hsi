'use client';

import { HeaderElement } from '@/types/rapor-builder';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface HeaderPropertyEditorProps {
  element: HeaderElement;
  onChange: (updates: Partial<HeaderElement>) => void;
}

export default function HeaderPropertyEditor({
  element,
  onChange,
}: HeaderPropertyEditorProps) {
  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Logo</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Logo Source</label>
            <select
              value={element.content.logo?.source || 'url'}
              onChange={(e) =>
                onChange({
                  content: {
                    ...element.content,
                    logo: {
                      source: e.target.value as 'upload' | 'url' | 'binding',
                      value: element.content.logo?.value || '',
                      size: element.content.logo?.size || { width: 80, height: 80 },
                      position: element.content.logo?.position || 'left',
                    },
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

          {element.content.logo && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  {element.content.logo.source === 'binding' ? 'Binding' : 'Logo URL'}
                </label>
                <input
                  type="text"
                  value={element.content.logo.value}
                  onChange={(e) =>
                    onChange({
                      content: {
                        ...element.content,
                        logo: element.content.logo
                          ? { ...element.content.logo, value: e.target.value }
                          : undefined,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    element.content.logo.source === 'binding'
                      ? '{{school.logo_url}}'
                      : 'https://...'
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Logo Width</label>
                  <input
                    type="number"
                    value={element.content.logo.size.width}
                    onChange={(e) =>
                      onChange({
                        content: {
                          ...element.content,
                          logo: element.content.logo
                            ? {
                                ...element.content.logo,
                                size: {
                                  ...element.content.logo.size,
                                  width: Number(e.target.value),
                                },
                              }
                            : undefined,
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Logo Height</label>
                  <input
                    type="number"
                    value={element.content.logo.size.height}
                    onChange={(e) =>
                      onChange({
                        content: {
                          ...element.content,
                          logo: element.content.logo
                            ? {
                                ...element.content.logo,
                                size: {
                                  ...element.content.logo.size,
                                  height: Number(e.target.value),
                                },
                              }
                            : undefined,
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Logo Position</label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() =>
                        onChange({
                          content: {
                            ...element.content,
                            logo: element.content.logo
                              ? { ...element.content.logo, position: pos }
                              : undefined,
                          },
                        })
                      }
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                        element.content.logo?.position === pos
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pos === 'left' && <AlignLeft className="w-4 h-4 mx-auto" />}
                      {pos === 'center' && <AlignCenter className="w-4 h-4 mx-auto" />}
                      {pos === 'right' && <AlignRight className="w-4 h-4 mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Title</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Title Text</label>
            <input
              type="text"
              value={element.content.title.text}
              onChange={(e) =>
                onChange({
                  content: {
                    ...element.content,
                    title: { ...element.content.title, text: e.target.value },
                  },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Size</label>
              <input
                type="number"
                value={element.content.title.fontSize}
                onChange={(e) =>
                  onChange({
                    content: {
                      ...element.content,
                      title: {
                        ...element.content.title,
                        fontSize: Number(e.target.value),
                      },
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
              <select
                value={element.content.title.fontWeight}
                onChange={(e) =>
                  onChange({
                    content: {
                      ...element.content,
                      title: {
                        ...element.content.title,
                        fontWeight: e.target.value as any,
                      },
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Family</label>
            <select
              value={element.content.title.fontFamily}
              onChange={(e) =>
                onChange({
                  content: {
                    ...element.content,
                    title: { ...element.content.title, fontFamily: e.target.value },
                  },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Color</label>
            <input
              type="color"
              value={element.content.title.color}
              onChange={(e) =>
                onChange({
                  content: {
                    ...element.content,
                    title: { ...element.content.title, color: e.target.value },
                  },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Alignment</label>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() =>
                    onChange({
                      content: {
                        ...element.content,
                        title: { ...element.content.title, align },
                      },
                    })
                  }
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    element.content.title.align === align
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
        </div>
      </div>

      {/* Subtitle Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Subtitle</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Subtitle Text</label>
            <input
              type="text"
              value={element.content.subtitle?.text || ''}
              onChange={(e) =>
                onChange({
                  content: {
                    ...element.content,
                    subtitle: {
                      text: e.target.value,
                      fontSize: element.content.subtitle?.fontSize || 14,
                      color: element.content.subtitle?.color || '#666666',
                    },
                  },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter subtitle (optional)..."
            />
          </div>

          {element.content.subtitle && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                <input
                  type="number"
                  value={element.content.subtitle.fontSize}
                  onChange={(e) =>
                    onChange({
                      content: {
                        ...element.content,
                        subtitle: element.content.subtitle
                          ? {
                              ...element.content.subtitle,
                              fontSize: Number(e.target.value),
                            }
                          : undefined,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                <input
                  type="color"
                  value={element.content.subtitle.color}
                  onChange={(e) =>
                    onChange({
                      content: {
                        ...element.content,
                        subtitle: element.content.subtitle
                          ? { ...element.content.subtitle, color: e.target.value }
                          : undefined,
                      },
                    })
                  }
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Background & Border */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Background & Border</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              value={element.style.backgroundColor}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, backgroundColor: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

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
                  value={element.style.padding.top}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        padding: {
                          ...element.style.padding,
                          top: Number(e.target.value),
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
                  value={element.style.padding.right}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        padding: {
                          ...element.style.padding,
                          right: Number(e.target.value),
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
                  value={element.style.padding.bottom}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        padding: {
                          ...element.style.padding,
                          bottom: Number(e.target.value),
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
                  value={element.style.padding.left}
                  onChange={(e) =>
                    onChange({
                      style: {
                        ...element.style,
                        padding: {
                          ...element.style.padding,
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
