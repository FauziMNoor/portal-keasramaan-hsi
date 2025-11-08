'use client';

import { ImageGalleryElement } from '@/types/rapor-builder';
import { Grid3x3, Rows, Columns } from 'lucide-react';

interface ImageGalleryPropertyEditorProps {
  element: ImageGalleryElement;
  onChange: (updates: Partial<ImageGalleryElement>) => void;
}

export default function ImageGalleryPropertyEditor({
  element,
  onChange,
}: ImageGalleryPropertyEditorProps) {
  return (
    <div className="space-y-6">
      {/* Data Source Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Source</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Source</label>
            <input
              type="text"
              value={element.dataBinding.source}
              disabled
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Images will be fetched from Galeri Kegiatan
            </p>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Max Images</label>
            <input
              type="number"
              value={element.dataBinding.maxImages}
              onChange={(e) =>
                onChange({
                  dataBinding: {
                    ...element.dataBinding,
                    maxImages: Number(e.target.value),
                  },
                })
              }
              min="1"
              max="20"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of images to display (1-20)
            </p>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Sort By</label>
            <select
              value={element.dataBinding.sortBy || 'date'}
              onChange={(e) =>
                onChange({
                  dataBinding: {
                    ...element.dataBinding,
                    sortBy: e.target.value as 'date' | 'random',
                  },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Most Recent</option>
              <option value="random">Random</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Layout</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Layout Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['grid', 'row', 'column'] as const).map((layoutType) => (
                <button
                  key={layoutType}
                  onClick={() =>
                    onChange({
                      layout: { ...element.layout, type: layoutType },
                    })
                  }
                  className={`flex flex-col items-center gap-2 px-3 py-3 text-sm rounded-lg border transition-colors ${
                    element.layout.type === layoutType
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {layoutType === 'grid' && <Grid3x3 className="w-5 h-5" />}
                  {layoutType === 'row' && <Rows className="w-5 h-5" />}
                  {layoutType === 'column' && <Columns className="w-5 h-5" />}
                  <span className="text-xs capitalize">{layoutType}</span>
                </button>
              ))}
            </div>
          </div>

          {element.layout.type === 'grid' && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Grid Columns</label>
              <input
                type="number"
                value={element.layout.columns || 3}
                onChange={(e) =>
                  onChange({
                    layout: { ...element.layout, columns: Number(e.target.value) },
                  })
                }
                min="1"
                max="6"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-600 mb-1">Gap (spacing)</label>
            <input
              type="range"
              value={element.layout.gap}
              onChange={(e) =>
                onChange({
                  layout: { ...element.layout, gap: Number(e.target.value) },
                })
              }
              min="0"
              max="40"
              step="2"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0px</span>
              <span className="font-medium text-gray-700">{element.layout.gap}px</span>
              <span>40px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Style Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Image Style</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width</label>
              <input
                type="number"
                value={element.imageStyle.width}
                onChange={(e) =>
                  onChange({
                    imageStyle: {
                      ...element.imageStyle,
                      width: Number(e.target.value),
                    },
                  })
                }
                min="50"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height</label>
              <input
                type="number"
                value={element.imageStyle.height}
                onChange={(e) =>
                  onChange({
                    imageStyle: {
                      ...element.imageStyle,
                      height: Number(e.target.value),
                    },
                  })
                }
                min="50"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Image Fit</label>
            <select
              value={element.imageStyle.fit}
              onChange={(e) =>
                onChange({
                  imageStyle: {
                    ...element.imageStyle,
                    fit: e.target.value as 'cover' | 'contain',
                  },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cover">Cover (crop to fill)</option>
              <option value="contain">Contain (fit within bounds)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Border Radius</label>
            <input
              type="range"
              value={element.imageStyle.borderRadius || 0}
              onChange={(e) =>
                onChange({
                  imageStyle: {
                    ...element.imageStyle,
                    borderRadius: Number(e.target.value),
                  },
                })
              }
              min="0"
              max="50"
              step="1"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0px</span>
              <span className="font-medium text-gray-700">
                {element.imageStyle.borderRadius || 0}px
              </span>
              <span>50px</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Border Color</label>
            <input
              type="color"
              value={element.imageStyle.borderColor || '#000000'}
              onChange={(e) =>
                onChange({
                  imageStyle: { ...element.imageStyle, borderColor: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Border Width</label>
            <input
              type="number"
              value={element.imageStyle.borderWidth || 0}
              onChange={(e) =>
                onChange({
                  imageStyle: {
                    ...element.imageStyle,
                    borderWidth: Number(e.target.value),
                  },
                })
              }
              min="0"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Caption Options Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Captions</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.options.showCaptions}
              onChange={(e) =>
                onChange({
                  options: { ...element.options, showCaptions: e.target.checked },
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show Captions</span>
          </label>

          {element.options.showCaptions && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Caption Position</label>
                <select
                  value={element.options.captionPosition}
                  onChange={(e) =>
                    onChange({
                      options: {
                        ...element.options,
                        captionPosition: e.target.value as 'below' | 'overlay',
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="below">Below Image</option>
                  <option value="overlay">Overlay on Image</option>
                </select>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-gray-600 mb-2">Caption Style</h5>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                    <input
                      type="number"
                      value={element.options.captionStyle?.fontSize || 12}
                      onChange={(e) =>
                        onChange({
                          options: {
                            ...element.options,
                            captionStyle: {
                              fontSize: Number(e.target.value),
                              color: element.options.captionStyle?.color || '#000000',
                              backgroundColor:
                                element.options.captionStyle?.backgroundColor,
                            },
                          },
                        })
                      }
                      min="8"
                      max="24"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={element.options.captionStyle?.color || '#000000'}
                      onChange={(e) =>
                        onChange({
                          options: {
                            ...element.options,
                            captionStyle: {
                              fontSize: element.options.captionStyle?.fontSize || 12,
                              color: e.target.value,
                              backgroundColor:
                                element.options.captionStyle?.backgroundColor,
                            },
                          },
                        })
                      }
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  {element.options.captionPosition === 'overlay' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={
                          element.options.captionStyle?.backgroundColor || '#000000'
                        }
                        onChange={(e) =>
                          onChange({
                            options: {
                              ...element.options,
                              captionStyle: {
                                fontSize: element.options.captionStyle?.fontSize || 12,
                                color: element.options.captionStyle?.color || '#ffffff',
                                backgroundColor: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Images will be automatically fetched from Galeri Kegiatan
          based on the selected periode when generating the rapor.
        </p>
      </div>
    </div>
  );
}
