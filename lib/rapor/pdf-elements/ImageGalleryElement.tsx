/**
 * Image Gallery Element Renderer for PDF
 * 
 * Renders image galleries with multiple images for PDF output
 */

import React from 'react';
import { View, Image, Text, StyleSheet } from '@react-pdf/renderer';
import type { ImageGalleryElement } from '@/types/rapor-builder';
import { resolvePlaceholder } from '../placeholder-resolver';

interface ImageGalleryElementPDFProps {
  element: ImageGalleryElement;
  data: any;
  pixelsToMm: (pixels: number) => number;
  imageCache?: Map<string, string>; // Cache of downloaded images as base64
}

export const ImageGalleryElementPDF: React.FC<ImageGalleryElementPDFProps> = ({
  element,
  data,
  pixelsToMm,
  imageCache,
}) => {
  const { dataBinding, layout, imageStyle, options, position, size } = element;

  // Resolve gallery data
  const galleryData = resolvePlaceholder(dataBinding.source, data);
  const images = Array.isArray(galleryData) ? galleryData : [];

  // Apply max images limit
  const limitedImages = images.slice(0, dataBinding.maxImages);

  // Container style
  const containerStyle = {
    position: 'absolute' as const,
    left: pixelsToMm(position.x),
    top: pixelsToMm(position.y),
    width: pixelsToMm(size.width),
    height: pixelsToMm(size.height),
    display: 'flex' as const,
    flexDirection: layout.type === 'column' ? ('column' as const) : ('row' as const),
    flexWrap: layout.type === 'grid' ? ('wrap' as const) : ('nowrap' as const),
    gap: pixelsToMm(layout.gap),
  };

  // Image container style
  const imageContainerStyle = {
    width: pixelsToMm(imageStyle.width),
    height: pixelsToMm(imageStyle.height),
    borderColor: imageStyle.borderColor,
    borderWidth: imageStyle.borderWidth ? pixelsToMm(imageStyle.borderWidth) : 0,
    borderRadius: imageStyle.borderRadius ? pixelsToMm(imageStyle.borderRadius) : 0,
    overflow: 'hidden' as const,
    marginBottom: options.showCaptions && options.captionPosition === 'below' ? 4 : 0,
  };

  // Image style
  const imgStyle = {
    width: pixelsToMm(imageStyle.width),
    height: pixelsToMm(imageStyle.height),
    objectFit: imageStyle.fit as 'cover' | 'contain',
  };

  // Caption style
  const captionStyle = options.captionStyle
    ? {
        fontSize: options.captionStyle.fontSize,
        color: options.captionStyle.color,
        backgroundColor: options.captionStyle.backgroundColor,
        padding: 2,
        textAlign: 'center' as const,
      }
    : {
        fontSize: 8,
        color: '#666666',
        textAlign: 'center' as const,
      };

  // Empty state
  if (limitedImages.length === 0) {
    return (
      <View
        style={{
          ...containerStyle,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Text style={{ fontSize: 10, color: '#999999' }}>Tidak ada foto</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {limitedImages.map((item: any, index: number) => {
        const imageUrl = item.foto_url || item.url || '';
        const caption = item.caption || item.nama_kegiatan || '';
        
        // Get cached image if available
        const cachedImage = imageCache?.get(imageUrl);
        const finalImageUrl = cachedImage || imageUrl;

        return (
          <View key={index} style={{ marginBottom: pixelsToMm(layout.gap) }}>
            <View style={imageContainerStyle}>
              {finalImageUrl ? (
                <Image src={finalImageUrl} style={imgStyle} />
              ) : (
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
                  <Text style={{ fontSize: 8, color: '#999999' }}>Foto tidak tersedia</Text>
                </View>
              )}
            </View>

            {options.showCaptions && caption && options.captionPosition === 'below' && (
              <Text style={captionStyle}>{caption}</Text>
            )}

            {options.showCaptions && caption && options.captionPosition === 'overlay' && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  padding: 4,
                }}
              >
                <Text style={{ ...captionStyle, color: '#ffffff' }}>{caption}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};
