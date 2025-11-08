'use client';

import { memo } from 'react';
import type { LineElement } from '@/types/rapor-builder';

interface LineElementRendererProps {
  element: LineElement;
}

function LineElementRenderer({ element }: LineElementRendererProps) {
  const { style, size } = element;

  // Determine if line is horizontal or vertical based on dimensions
  const isHorizontal = size.width > size.height;

  const lineStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
  };

  if (isHorizontal) {
    // Horizontal line
    lineStyle.borderTop = `${style.width}px ${style.style} ${style.color}`;
  } else {
    // Vertical line
    lineStyle.borderLeft = `${style.width}px ${style.style} ${style.color}`;
  }

  return <div style={lineStyle} />;
}

// Memoize to prevent unnecessary re-renders
export default memo(LineElementRenderer);
