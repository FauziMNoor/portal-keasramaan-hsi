'use client';

import { DataTableElement, TableColumn } from '@/types/rapor-builder';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface DataTablePropertyEditorProps {
  element: DataTableElement;
  onChange: (updates: Partial<DataTableElement>) => void;
}

export default function DataTablePropertyEditor({
  element,
  onChange,
}: DataTablePropertyEditorProps) {
  const [newColumnHeader, setNewColumnHeader] = useState('');
  const [newColumnField, setNewColumnField] = useState('');

  const addColumn = () => {
    if (!newColumnHeader || !newColumnField) return;

    const newColumn: TableColumn = {
      id: `col-${Date.now()}`,
      header: newColumnHeader,
      field: newColumnField,
      width: 'auto',
      align: 'left',
      format: 'text',
    };

    onChange({
      columns: [...element.columns, newColumn],
    });

    setNewColumnHeader('');
    setNewColumnField('');
  };

  const updateColumn = (index: number, updates: Partial<TableColumn>) => {
    const newColumns = [...element.columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    onChange({ columns: newColumns });
  };

  const removeColumn = (index: number) => {
    onChange({
      columns: element.columns.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Data Source Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Source</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Source</label>
            <select
              value={element.dataBinding.source}
              onChange={(e) =>
                onChange({
                  dataBinding: { ...element.dataBinding, source: e.target.value },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="habit_tracker.ubudiyah">Habit Tracker - Ubudiyah</option>
              <option value="habit_tracker.akhlaq">Habit Tracker - Akhlaq</option>
              <option value="habit_tracker.kedisiplinan">Habit Tracker - Kedisiplinan</option>
              <option value="habit_tracker.kebersihan">Habit Tracker - Kebersihan</option>
              <option value="habit_tracker.all">Habit Tracker - All Categories</option>
              <option value="custom">Custom Data</option>
            </select>
          </div>
        </div>
      </div>

      {/* Columns Configuration */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Columns</h4>
        <div className="space-y-3">
          {/* Existing Columns */}
          {element.columns.map((column, index) => (
            <div
              key={column.id}
              className="p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-start gap-2 mb-3">
                <GripVertical className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={column.header}
                    onChange={(e) => updateColumn(index, { header: e.target.value })}
                    placeholder="Column Header"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={column.field}
                    onChange={(e) => updateColumn(index, { field: e.target.value })}
                    placeholder="Field binding (e.g., indikator, nilai)"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={column.align || 'left'}
                      onChange={(e) =>
                        updateColumn(index, { align: e.target.value as any })
                      }
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                    <select
                      value={column.format || 'text'}
                      onChange={(e) =>
                        updateColumn(index, { format: e.target.value as any })
                      }
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="percentage">Percentage</option>
                      <option value="date">Date</option>
                    </select>
                    <input
                      type="number"
                      value={column.width === 'auto' ? '' : column.width}
                      onChange={(e) =>
                        updateColumn(index, {
                          width: e.target.value ? Number(e.target.value) : 'auto',
                        })
                      }
                      placeholder="Width"
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeColumn(index)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Column */}
          <div className="p-3 border border-dashed border-gray-300 rounded-lg">
            <div className="space-y-2">
              <input
                type="text"
                value={newColumnHeader}
                onChange={(e) => setNewColumnHeader(e.target.value)}
                placeholder="Column Header"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={newColumnField}
                onChange={(e) => setNewColumnField(e.target.value)}
                placeholder="Field binding"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addColumn}
                disabled={!newColumnHeader || !newColumnField}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Column
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header Styling */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Header Style</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              value={element.style.headerBackgroundColor}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, headerBackgroundColor: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Color</label>
            <input
              type="color"
              value={element.style.headerTextColor}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, headerTextColor: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Size</label>
              <input
                type="number"
                value={element.style.headerFontSize}
                onChange={(e) =>
                  onChange({
                    style: { ...element.style, headerFontSize: Number(e.target.value) },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
              <select
                value={element.style.headerFontWeight}
                onChange={(e) =>
                  onChange({
                    style: { ...element.style, headerFontWeight: e.target.value as any },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold (700)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Row Styling */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Row Style</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              value={element.style.rowBackgroundColor}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, rowBackgroundColor: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Alternate Row Color</label>
            <input
              type="color"
              value={element.style.rowAlternateColor || '#f9fafb'}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, rowAlternateColor: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Color</label>
            <input
              type="color"
              value={element.style.rowTextColor}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, rowTextColor: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Size</label>
            <input
              type="number"
              value={element.style.rowFontSize}
              onChange={(e) =>
                onChange({
                  style: { ...element.style, rowFontSize: Number(e.target.value) },
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Border & Padding */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Border & Padding</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Border Color</label>
            <input
              type="color"
              value={element.style.borderColor}
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
                value={element.style.borderWidth}
                onChange={(e) =>
                  onChange({
                    style: { ...element.style, borderWidth: Number(e.target.value) },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Cell Padding</label>
              <input
                type="number"
                value={element.style.cellPadding}
                onChange={(e) =>
                  onChange({
                    style: { ...element.style, cellPadding: Number(e.target.value) },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Options */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Options</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.options.showHeader}
              onChange={(e) =>
                onChange({
                  options: { ...element.options, showHeader: e.target.checked },
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show Header</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.options.showBorders}
              onChange={(e) =>
                onChange({
                  options: { ...element.options, showBorders: e.target.checked },
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show Borders</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.options.alternateRows}
              onChange={(e) =>
                onChange({
                  options: { ...element.options, alternateRows: e.target.checked },
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Alternate Row Colors</span>
          </label>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Max Rows (optional)</label>
            <input
              type="number"
              value={element.options.maxRows || ''}
              onChange={(e) =>
                onChange({
                  options: {
                    ...element.options,
                    maxRows: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              placeholder="No limit"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
