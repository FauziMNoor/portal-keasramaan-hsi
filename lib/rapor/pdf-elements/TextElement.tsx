/**
 * Text Element Renderer for PDF
 * 
 * Renders text elements with styling for PDF output
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { TextElement } from '@/types/rapor-builder';
import { replacePlaceholders } from '../placeholder-resolver';

interface TextElementPDFProps {
  element: TextElement;
  data: any;
  pixelsToMm: (pixels: number) => number;
}

export const TextElementPDF: React.FC<TextElementPDFProps> = ({
  element,
  data,
  pixelsToMm,
}) => {
  const { content, style, position, size } = element;

  // Resolve placeholders in text
  const resolvedText = replacePlaceholders(content.text, data);

  // Create styles
  const containerStyle = {
    position: 'absolute' as const,
    left: pixelsToMm(position.x),
    top: pixelsToMm(position.y),
    width: pixelsToMm(size.width),
    height: pixelsToMm(size.height),
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth ? pixelsToMm(style.borderWidth) : 0,
    borderRadius: style.borderRadius ? pixelsToMm(style.borderRadius) : 0,
    paddingTop: style.padding?.top ? pixelsToMm(style.padding.top) : 0,
    paddingRight: style.padding?.right ? pixelsToMm(style.padding.right) : 0,
    paddingBottom: style.padding?.bottom ? pixelsToMm(style.padding.bottom) : 0,
    paddingLeft: style.padding?.left ? pixelsToMm(style.padding.left) : 0,
    display: 'flex' as const,
    justifyContent: 'flex-start' as const,
    alignItems: 'flex-start' as const,
  };

  const textStyle = {
    fontSize: style.fontSize,
    fontWeight: style.fontWeight === 'bold' ? 'bold' as const : 'normal' as const,
    fontFamily: style.fontFamily || 'Helvetica',
    color: style.color,
    textAlign: style.textAlign as 'left' | 'center' | 'right' | 'justify',
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
  };

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{resolvedText}</Text>
    </View>
  );
};
