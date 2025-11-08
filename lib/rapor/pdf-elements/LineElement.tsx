/**
 * Line Element Renderer for PDF
 * 
 * Renders divider lines for PDF output
 */

import React from 'react';
import { View, StyleSheet, Svg, Line as SvgLine } from '@react-pdf/renderer';
import type { LineElement } from '@/types/rapor-builder';

interface LineElementPDFProps {
  element: LineElement;
  pixelsToMm: (pixels: number) => number;
}

export const LineElementPDF: React.FC<LineElementPDFProps> = ({ element, pixelsToMm }) => {
  const { style, position, size } = element;

  // Determine if line is horizontal or vertical based on dimensions
  const isHorizontal = size.width > size.height;

  // Container style
  const containerStyle = {
    position: 'absolute' as const,
    left: pixelsToMm(position.x),
    top: pixelsToMm(position.y),
    width: pixelsToMm(size.width),
    height: pixelsToMm(size.height),
  };

  // For solid lines, we can use a simple View
  if (style.style === 'solid') {
    const solidLineStyle = {
      ...containerStyle,
      backgroundColor: style.color,
      width: isHorizontal ? pixelsToMm(size.width) : pixelsToMm(style.width),
      height: isHorizontal ? pixelsToMm(style.width) : pixelsToMm(size.height),
    };

    return <View style={solidLineStyle} />;
  }

  // For dashed and dotted lines, use SVG
  const strokeDasharray = style.style === 'dashed' ? '5,5' : '2,2';

  return (
    <View style={containerStyle}>
      <Svg width={pixelsToMm(size.width)} height={pixelsToMm(size.height)}>
        <SvgLine
          x1={0}
          y1={isHorizontal ? pixelsToMm(style.width) / 2 : 0}
          x2={isHorizontal ? pixelsToMm(size.width) : pixelsToMm(style.width) / 2}
          y2={isHorizontal ? pixelsToMm(style.width) / 2 : pixelsToMm(size.height)}
          strokeWidth={pixelsToMm(style.width)}
          stroke={style.color}
          strokeDasharray={strokeDasharray}
        />
      </Svg>
    </View>
  );
};
