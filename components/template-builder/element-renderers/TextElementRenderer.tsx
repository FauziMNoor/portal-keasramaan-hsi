'use client';

import { memo } from 'react';
import type { TextElement } from '@/types/rapor-builder';

interface TextElementRendererProps {
  element: TextElement;
}

function TextElementRenderer({ element }: TextElementRendererProps) {
  const { content, style } = element;

  // Check if text contains placeholders
  const hasPlaceholders = /\{\{[^}]+\}\}/.test(content.text);

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{
        fontSize: `${style.fontSize}px`,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
        color: style.color,
        backgroundColor: style.backgroundColor,
        textAlign: style.textAlign,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
        padding: style.padding
          ? `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`
          : '8px',
        borderColor: style.borderColor,
        borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
        borderStyle: style.borderWidth ? 'solid' : undefined,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {content.richText && content.html ? (
        <div
          dangerouslySetInnerHTML={{ __html: content.html }}
          style={{ margin: 0 }}
        />
      ) : (
        <>
          {content.text || 'Teks baru. Klik untuk edit.'}
          {hasPlaceholders && (
            <span className="text-xs text-gray-400 ml-2">(dengan data binding)</span>
          )}
        </>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(TextElementRenderer);
