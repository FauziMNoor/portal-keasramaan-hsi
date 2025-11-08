'use client';

import { memo } from 'react';
import type { SignatureElement } from '@/types/rapor-builder';

interface SignatureElementRendererProps {
  element: SignatureElement;
}

function SignatureElementRenderer({ element }: SignatureElementRendererProps) {
  const { content, style } = element;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '8px',
    fontSize: `${style.fontSize}px`,
    fontFamily: style.fontFamily,
    color: style.color,
    textAlign: style.textAlign,
  };

  return (
    <div style={containerStyle}>
      {/* Label */}
      <div style={{ marginBottom: '8px' }}>
        {content.label || 'Pembina Asrama'}
      </div>

      {/* Signature space (empty space for actual signature) */}
      <div style={{ minHeight: '40px', marginBottom: '8px' }} />

      {/* Signature line */}
      {content.showLine && (
        <div
          style={{
            borderTop: `${style.lineWidth || 1}px solid ${style.lineColor || '#000000'}`,
            width: '100%',
            marginBottom: '8px',
          }}
        />
      )}

      {/* Name */}
      {content.name && (
        <div style={{ marginBottom: '4px', fontWeight: 500 }}>
          {content.name}
        </div>
      )}

      {/* Date */}
      {content.showDate && (
        <div style={{ fontSize: `${style.fontSize * 0.85}px`, color: '#666666' }}>
          {new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(SignatureElementRenderer);
