/**
 * Signature Element Renderer for PDF
 * 
 * Renders signature blocks with labels and lines for PDF output
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { SignatureElement } from '@/types/rapor-builder';
import { replacePlaceholders } from '../placeholder-resolver';

interface SignatureElementPDFProps {
  element: SignatureElement;
  data: any;
  pixelsToMm: (pixels: number) => number;
}

export const SignatureElementPDF: React.FC<SignatureElementPDFProps> = ({
  element,
  data,
  pixelsToMm,
}) => {
  const { content, style, position, size } = element;

  // Resolve placeholders
  const resolvedLabel = replacePlaceholders(content.label, data);
  const resolvedName = content.name ? replacePlaceholders(content.name, data) : '';

  // Get current date if showDate is true
  const currentDate = content.showDate
    ? new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  // Container style
  const containerStyle = {
    position: 'absolute' as const,
    left: pixelsToMm(position.x),
    top: pixelsToMm(position.y),
    width: pixelsToMm(size.width),
    height: pixelsToMm(size.height),
    display: 'flex' as const,
    flexDirection: 'column' as const,
    justifyContent: 'flex-start' as const,
    alignItems: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'flex-end' : 'flex-start',
  };

  // Text style
  const textStyle = {
    fontSize: style.fontSize,
    fontFamily: style.fontFamily || 'Helvetica',
    color: style.color,
    textAlign: style.textAlign as 'left' | 'center' | 'right',
  };

  // Line style
  const lineStyle = {
    width: pixelsToMm(size.width * 0.6), // 60% of container width
    height: style.lineWidth ? pixelsToMm(style.lineWidth) : 1,
    backgroundColor: style.lineColor || '#000000',
    marginTop: 40, // Space for signature
    marginBottom: 4,
  };

  return (
    <View style={containerStyle}>
      {/* Label */}
      <Text style={textStyle}>{resolvedLabel}</Text>

      {/* Date */}
      {content.showDate && currentDate && (
        <Text style={{ ...textStyle, marginTop: 4 }}>{currentDate}</Text>
      )}

      {/* Signature line */}
      {content.showLine && <View style={lineStyle} />}

      {/* Name */}
      {resolvedName && (
        <Text style={{ ...textStyle, fontWeight: 'bold', marginTop: 4 }}>
          {resolvedName}
        </Text>
      )}
    </View>
  );
};
