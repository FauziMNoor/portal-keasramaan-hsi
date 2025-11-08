'use client';

import { memo } from 'react';
import type { HeaderElement } from '@/types/rapor-builder';
import Image from 'next/image';

interface HeaderElementRendererProps {
  element: HeaderElement;
}

function HeaderElementRenderer({ element }: HeaderElementRendererProps) {
  const { content, style } = element;

  return (
    <div
      className="w-full h-full flex items-center"
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
        borderStyle: style.borderWidth ? 'solid' : undefined,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        padding: `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`,
      }}
    >
      {/* Logo */}
      {content.logo && (
        <div
          className="shrink-0"
          style={{
            width: content.logo.size.width,
            height: content.logo.size.height,
            marginRight: content.logo.position === 'left' ? '16px' : '0',
            marginLeft: content.logo.position === 'right' ? '16px' : '0',
          }}
        >
          {content.logo.value ? (
            content.logo.source === 'binding' ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500">
                {content.logo.value}
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={content.logo.value}
                  alt="Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500">
              Logo
            </div>
          )}
        </div>
      )}

      {/* Title and Subtitle */}
      <div
        className="flex-1"
        style={{
          textAlign: content.logo?.position === 'center' ? 'center' : content.title.align,
        }}
      >
        <h2
          style={{
            fontSize: `${content.title.fontSize}px`,
            fontWeight: content.title.fontWeight,
            fontFamily: content.title.fontFamily,
            color: content.title.color,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {content.title.text || 'Judul Header'}
        </h2>
        {content.subtitle && (
          <p
            style={{
              fontSize: `${content.subtitle.fontSize}px`,
              color: content.subtitle.color,
              margin: '8px 0 0 0',
              lineHeight: 1.4,
            }}
          >
            {content.subtitle.text}
          </p>
        )}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(HeaderElementRenderer);
