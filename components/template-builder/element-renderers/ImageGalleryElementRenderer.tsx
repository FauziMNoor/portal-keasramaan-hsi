'use client';

import { memo } from 'react';
import type { ImageGalleryElement } from '@/types/rapor-builder';
import { ImageIcon } from 'lucide-react';

interface ImageGalleryElementRendererProps {
  element: ImageGalleryElement;
}

function ImageGalleryElementRenderer({ element }: ImageGalleryElementRendererProps) {
  const { dataBinding, layout, imageStyle, options } = element;

  // Generate placeholder images
  const imageCount = Math.min(dataBinding.maxImages, 12);
  const placeholders = Array.from({ length: imageCount }, (_, i) => i + 1);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    padding: '8px',
  };

  const layoutStyle: React.CSSProperties = {
    display: layout.type === 'grid' ? 'grid' : 'flex',
    gap: `${layout.gap}px`,
  };

  if (layout.type === 'grid') {
    layoutStyle.gridTemplateColumns = `repeat(${layout.columns || 3}, 1fr)`;
  } else if (layout.type === 'row') {
    layoutStyle.flexDirection = 'row';
    layoutStyle.flexWrap = 'wrap';
  } else if (layout.type === 'column') {
    layoutStyle.flexDirection = 'column';
  }

  const imageContainerStyle: React.CSSProperties = {
    width: layout.type === 'grid' ? '100%' : `${imageStyle.width}px`,
    height: layout.type === 'grid' ? 'auto' : `${imageStyle.height}px`,
    aspectRatio: layout.type === 'grid' ? `${imageStyle.width}/${imageStyle.height}` : undefined,
    borderRadius: imageStyle.borderRadius ? `${imageStyle.borderRadius}px` : undefined,
    borderColor: imageStyle.borderColor,
    borderWidth: imageStyle.borderWidth ? `${imageStyle.borderWidth}px` : undefined,
    borderStyle: imageStyle.borderWidth ? 'solid' : undefined,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={layoutStyle}>
        {placeholders.map((index) => (
          <div key={index}>
            <div
              style={imageContainerStyle}
              className="bg-gray-200 flex flex-col items-center justify-center"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Foto {index}</span>
            </div>
            {options.showCaptions && (
              <div
                style={{
                  fontSize: options.captionStyle?.fontSize
                    ? `${options.captionStyle.fontSize}px`
                    : '12px',
                  color: options.captionStyle?.color || '#666666',
                  backgroundColor: options.captionStyle?.backgroundColor,
                  padding: options.captionPosition === 'overlay' ? '4px 8px' : '4px 0',
                  marginTop: options.captionPosition === 'below' ? '4px' : '0',
                  textAlign: 'center',
                }}
              >
                Caption {index}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Data source indicator */}
      <div className="text-xs text-gray-400 mt-2">
        Max {dataBinding.maxImages} images from {dataBinding.source}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(ImageGalleryElementRenderer);
