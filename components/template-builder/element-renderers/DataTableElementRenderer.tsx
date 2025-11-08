'use client';

import { memo } from 'react';
import type { DataTableElement } from '@/types/rapor-builder';

interface DataTableElementRendererProps {
  element: DataTableElement;
}

function DataTableElementRenderer({ element }: DataTableElementRendererProps) {
  const { columns, style, options, dataBinding } = element;

  // Generate sample rows for preview
  const sampleRowCount = options.maxRows || 3;
  const sampleRows = Array.from({ length: Math.min(sampleRowCount, 5) }, (_, i) => i + 1);

  // Format sample data based on column format
  const formatSampleData = (format: string | undefined, rowIndex: number) => {
    switch (format) {
      case 'number':
        return (85 + rowIndex * 2).toString();
      case 'percentage':
        return `${85 + rowIndex * 2}%`;
      case 'date':
        return new Date().toLocaleDateString('id-ID');
      default:
        return `Sample ${rowIndex}`;
    }
  };

  return (
    <div className="w-full h-full overflow-auto">
      <table
        className="w-full border-collapse"
        style={{
          borderSpacing: 0,
        }}
      >
        {options.showHeader && (
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{
                    backgroundColor: style.headerBackgroundColor,
                    color: style.headerTextColor,
                    fontSize: `${style.headerFontSize}px`,
                    fontWeight: style.headerFontWeight,
                    padding: `${style.cellPadding}px`,
                    border: options.showBorders
                      ? `${style.borderWidth}px solid ${style.borderColor}`
                      : 'none',
                    textAlign: col.align || 'left',
                    width: col.width === 'auto' ? 'auto' : `${col.width}px`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {sampleRows.map((rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td
                  key={col.id}
                  style={{
                    backgroundColor:
                      options.alternateRows && rowIndex % 2 === 0
                        ? style.rowAlternateColor || style.rowBackgroundColor
                        : style.rowBackgroundColor,
                    color: style.rowTextColor,
                    fontSize: `${style.rowFontSize}px`,
                    padding: `${style.cellPadding}px`,
                    border: options.showBorders
                      ? `${style.borderWidth}px solid ${style.borderColor}`
                      : 'none',
                    textAlign: col.align || 'left',
                  }}
                >
                  {formatSampleData(col.format, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Data source indicator */}
      <div className="text-xs text-gray-400 mt-2 px-2">
        Data source: {dataBinding.source}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(DataTableElementRenderer);
