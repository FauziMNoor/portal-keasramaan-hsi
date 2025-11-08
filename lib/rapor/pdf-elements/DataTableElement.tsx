/**
 * Data Table Element Renderer for PDF
 * 
 * Renders data tables with dynamic data binding for PDF output
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { DataTableElement } from '@/types/rapor-builder';
import { resolvePlaceholder, replacePlaceholders } from '../placeholder-resolver';

interface DataTableElementPDFProps {
  element: DataTableElement;
  data: any;
  pixelsToMm: (pixels: number) => number;
}

export const DataTableElementPDF: React.FC<DataTableElementPDFProps> = ({
  element,
  data,
  pixelsToMm,
}) => {
  const { dataBinding, columns, style, options, position, size } = element;

  // Resolve data source
  const tableData = resolvePlaceholder(dataBinding.source, data);
  const rows = Array.isArray(tableData) ? tableData : [];

  // Apply max rows limit
  const limitedRows = options.maxRows ? rows.slice(0, options.maxRows) : rows;

  // Container style
  const containerStyle = {
    position: 'absolute' as const,
    left: pixelsToMm(position.x),
    top: pixelsToMm(position.y),
    width: pixelsToMm(size.width),
    borderColor: style.borderColor,
    borderWidth: options.showBorders ? pixelsToMm(style.borderWidth) : 0,
  };

  // Header row style
  const headerRowStyle = {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    backgroundColor: style.headerBackgroundColor,
    borderBottomColor: style.borderColor,
    borderBottomWidth: options.showBorders ? pixelsToMm(style.borderWidth) : 0,
  };

  // Header cell style
  const headerCellStyle = {
    fontSize: style.headerFontSize,
    fontWeight: style.headerFontWeight === 'bold' ? 'bold' as const : 'normal' as const,
    color: style.headerTextColor,
    padding: pixelsToMm(style.cellPadding),
    textAlign: 'left' as const,
  };

  // Data row style
  const dataRowStyle = (index: number) => ({
    display: 'flex' as const,
    flexDirection: 'row' as const,
    backgroundColor:
      options.alternateRows && index % 2 === 1
        ? style.rowAlternateColor || style.rowBackgroundColor
        : style.rowBackgroundColor,
    borderBottomColor: style.borderColor,
    borderBottomWidth: options.showBorders ? pixelsToMm(style.borderWidth) : 0,
  });

  // Data cell style
  const dataCellStyle = (align?: string) => ({
    fontSize: style.rowFontSize,
    color: style.rowTextColor,
    padding: pixelsToMm(style.cellPadding),
    textAlign: (align || 'left') as 'left' | 'center' | 'right',
  });

  // Calculate column widths
  const totalWidth = pixelsToMm(size.width);
  const autoColumns = columns.filter((col) => !col.width || col.width === 'auto');
  const fixedWidth = columns
    .filter((col) => col.width && col.width !== 'auto')
    .reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 0), 0);
  const autoColumnWidth = autoColumns.length > 0 ? (totalWidth - fixedWidth) / autoColumns.length : 0;

  const getColumnWidth = (col: typeof columns[0]) => {
    if (!col.width || col.width === 'auto') {
      return autoColumnWidth;
    }
    return typeof col.width === 'number' ? col.width : autoColumnWidth;
  };

  // Format cell value based on column format
  const formatCellValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return '';

    switch (format) {
      case 'number':
        return typeof value === 'number' ? value.toFixed(1) : value.toString();
      case 'percentage':
        return typeof value === 'number' ? `${value.toFixed(1)}%` : `${value}%`;
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString('id-ID');
        }
        return value.toString();
      default:
        return value.toString();
    }
  };

  return (
    <View style={containerStyle}>
      {/* Header Row */}
      {options.showHeader && (
        <View style={headerRowStyle}>
          {columns.map((col) => (
            <View key={col.id} style={{ width: getColumnWidth(col) }}>
              <Text style={headerCellStyle}>{col.header}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Data Rows */}
      {limitedRows.map((row, rowIndex) => (
        <View key={rowIndex} style={dataRowStyle(rowIndex)}>
          {columns.map((col) => {
            const cellValue = resolvePlaceholder(col.field, row);
            const formattedValue = formatCellValue(cellValue, col.format);

            return (
              <View key={col.id} style={{ width: getColumnWidth(col) }}>
                <Text style={dataCellStyle(col.align)}>{formattedValue}</Text>
              </View>
            );
          })}
        </View>
      ))}

      {/* Empty state */}
      {limitedRows.length === 0 && (
        <View style={{ padding: pixelsToMm(style.cellPadding * 2) }}>
          <Text style={{ fontSize: style.rowFontSize, color: '#999999', textAlign: 'center' }}>
            Tidak ada data
          </Text>
        </View>
      )}
    </View>
  );
};
