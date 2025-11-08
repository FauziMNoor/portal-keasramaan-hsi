/**
 * Image Element Renderer for PDF
 * 
 * Renders image elements for PDF output
 */

import React from 'react';
import { View, Image, Text, StyleSheet } from '@react-pdf/renderer';
import type { ImageElement } from '@/types/rapor-builder';
import { resolvePlaceholder } from '../placeholder-resolver';

interface ImageElementPDFProps {
  element: ImageElement;
  data: any;
  pixelsToMm: (pixels: number) => number;
  imageCache?: Map<string, string>; // Cache of downloaded images as base64
}

export const ImageElementPDF: React.FC<ImageElementPDFProps> = ({
  element,
  data,
  pixelsToMm,
  imageCache,
}) => {
  const { content, style, position, size } = element;

  // Resolve image URL
  let imageUrl = content.value;
  if (content.source === 'binding') {
    const resolvedUrl = resolvePlaceholder(content.value, data);
    imageUrl = resolvedUrl || '';
  }

  // Get cached image if available
  const cachedImage = imageCache?.get(imageUrl);
  const finalImageUrl = cachedImage || imageUrl;

  // Container style
  const containerStyle = {
    position: 'absolute' as const,
    left: pixelsToMm(position.x),
    top: pixelsToMm(position.y),
    width: pixelsToMm(size.width),
    height: pixelsToMm(size.height),
    borderColor: style.borderColor,
    borderWidth: style.borderWidth ? pixelsToMm(style.borderWidth) : 0,
    borderRadius: style.borderRadius ? pixelsToMm(style.borderRadius) : 0,
    overflow: 'hidden' as const,
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  // Image style based on fit option
  const getImageStyle = () => {
    const baseStyle = {
      opacity: style.opacity !== undefined ? style.opacity : 1,
    };

    switch (content.fit) {
      case 'cover':
        return {
          ...baseStyle,
          width: pixelsToMm(size.width),
          height: pixelsToMm(size.height),
          objectFit: 'cover' as const,
        };
      case 'contain':
        return {
          ...baseStyle,
          maxWidth: pixelsToMm(size.width),
          maxHeight: pixelsToMm(size.height),
          objectFit: 'contain' as const,
        };
      case 'fill':
        return {
          ...baseStyle,
          width: pixelsToMm(size.width),
          height: pixelsToMm(size.height),
          objectFit: 'fill' as const,
        };
      case 'none':
      default:
        return baseStyle;
    }
  };

  // Render placeholder if no image
  if (!finalImageUrl) {
    return (
      <View style={containerStyle}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 10, color: '#999999' }}>
            {content.alt || 'Gambar tidak tersedia'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Image src={finalImageUrl} style={getImageStyle()} />
    </View>
  );
};
