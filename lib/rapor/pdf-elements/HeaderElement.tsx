/**
 * Header Element Renderer for PDF
 * 
 * Renders header elements with logo, title, and subtitle for PDF output
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { HeaderElement } from '@/types/rapor-builder';
import { replacePlaceholders } from '../placeholder-resolver';

interface HeaderElementPDFProps {
  element: HeaderElement;
  data: any;
  pixelsToMm: (pixels: number) => number;
}

export const HeaderElementPDF: React.FC<HeaderElementPDFProps> = ({
  element,
  data,
  pixelsToMm,
}) => {
  const { content, style, position, size } = element;

  // Resolve placeholders in text
  const resolvedTitle = replacePlaceholders(content.title.text, data);
  const resolvedSubtitle = content.subtitle
    ? replacePlaceholders(content.subtitle.text, data)
    : '';

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
    paddingTop: pixelsToMm(style.padding.top),
    paddingRight: pixelsToMm(style.padding.right),
    paddingBottom: pixelsToMm(style.padding.bottom),
    paddingLeft: pixelsToMm(style.padding.left),
    display: 'flex' as const,
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    alignItems: content.title.align === 'center' ? 'center' : content.title.align === 'right' ? 'flex-end' : 'flex-start',
  };

  const titleStyle = {
    fontSize: content.title.fontSize,
    fontWeight: content.title.fontWeight === 'bold' ? 'bold' as const : 'normal' as const,
    fontFamily: content.title.fontFamily || 'Helvetica',
    color: content.title.color,
    textAlign: content.title.align as 'left' | 'center' | 'right',
    marginBottom: content.subtitle ? 4 : 0,
  };

  const subtitleStyle = content.subtitle
    ? {
        fontSize: content.subtitle.fontSize,
        color: content.subtitle.color,
        textAlign: content.title.align as 'left' | 'center' | 'right',
      }
    : undefined;

  return (
    <View style={containerStyle as any}>
      {content.logo && content.logo.value && (
        <View
          style={{
            marginBottom: 8,
            alignSelf:
              content.logo.position === 'center'
                ? 'center'
                : content.logo.position === 'right'
                ? 'flex-end'
                : 'flex-start',
          }}
        >
          <Image
            src={content.logo.value}
            style={{
              width: pixelsToMm(content.logo.size.width),
              height: pixelsToMm(content.logo.size.height),
            }}
          />
        </View>
      )}
      
      <Text style={titleStyle}>{resolvedTitle}</Text>
      
      {content.subtitle && resolvedSubtitle && (
        <Text style={subtitleStyle}>{resolvedSubtitle}</Text>
      )}
    </View>
  );
};
