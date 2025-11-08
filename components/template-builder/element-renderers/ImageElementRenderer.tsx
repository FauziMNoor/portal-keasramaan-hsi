'use client';

import { memo } from 'react';
import type { ImageElement } from '@/types/rapor-builder';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ImageElementRendererProps {
  element: ImageElement;
}

function ImageElementRenderer({ element }: ImageElementRendererProps) {
  const { content, style } = element;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
    borderStyle: style.borderWidth ? 'solid' : undefined,
    overflow: 'hidden',
    position: 'relative',
  };

  // If no image value, show placeholder
  if (!content.value) {
    return (
      <div
        style={containerStyle}
        className="flex flex-col items-center justify-center bg-gray-100"
      >
        <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
        <span className="text-gray-400 text-sm">No Image</span>
      </div>
    );
  }

  // If binding placeholder, show placeholder text
  if (content.source === 'binding') {
    return (
      <div
        style={containerStyle}
        className="flex flex-col items-center justify-center bg-gray-100"
      >
        <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
        <span className="text-gray-500 text-xs text-center px-2">
          {content.value}
        </span>
      </div>
    );
  }

  // Render actual image
  return (
    <div style={containerStyle}>
      <Image
        src={content.value}
        alt={content.alt || 'Image'}
        fill
        style={{
          objectFit: content.fit,
          opacity: style.opacity !== undefined ? style.opacity : 1,
        }}
        unoptimized
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(ImageElementRenderer);
