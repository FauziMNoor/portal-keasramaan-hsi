'use client';

import { LineElement } from '@/types/rapor-builder';

interface LinePropertyEditorProps {
  element: LineElement;
  onChange: (updates: Partial<LineElement>) => void;
}

export default function LinePropertyEditor({
  element,
  onChange,
}: LinePropertyEditorProps) {
  return (
    <div className="space-y-6">
      {/* Line Style Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Line Style</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
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
            <label className="block text-xs text-gray-600 mb-1">Thickness (Width)</label>
            <input
              type="range"
              value={element.style.width}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, width: Number(e.target.value) },
                })
              }
              min="1"
              max="20"
              step="1"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1px</span>
              <span className="font-medium text-gray-700">{element.style.width}px</span>
              <span>20px</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Style</label>
            <select
              value={element.style.style}
              onChange={(e) =>
                onChange({
                  style: {
                    ...element.style,
                    style: e.target.value as 'solid' | 'dashed' | 'dotted',
                  },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div
            style={{
              width: '100%',
              height: `${element.style.width}px`,
              backgroundColor: element.style.color,
              borderTop:
                element.style.style === 'solid'
                  ? `${element.style.width}px solid ${element.style.color}`
                  : element.style.style === 'dashed'
                  ? `${element.style.width}px dashed ${element.style.color}`
                  : `${element.style.width}px dotted ${element.style.color}`,
            }}
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Use lines to create visual separators between sections
          in your rapor template.
        </p>
      </div>
    </div>
  );
}
