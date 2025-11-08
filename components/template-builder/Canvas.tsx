'use client';

import { useRef, memo, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useTemplateBuilderStore } from '@/lib/stores/template-builder-store';
import DraggableElement from './DraggableElement';
import type { ElementType, TemplateElement } from '@/types/rapor-builder';

// A4 dimensions in pixels at 96 DPI (for screen display)
const A4_WIDTH_PX = 794; // 210mm at 96 DPI
const A4_HEIGHT_PX = 1123; // 297mm at 96 DPI

interface CanvasProps {
  zoom: number;
}

// Helper function to create default element based on type
function createDefaultElement(
  type: ElementType,
  position: { x: number; y: number }
): TemplateElement {
  const baseElement = {
    id: crypto.randomUUID(),
    type,
    position,
    size: { width: 200, height: 100 },
    zIndex: 0,
    isVisible: true,
    isLocked: false,
  };

  switch (type) {
    case 'header':
      return {
        ...baseElement,
        type: 'header',
        size: { width: 700, height: 120 },
        content: {
          title: {
            text: 'Judul Header',
            fontSize: 24,
            fontWeight: 'bold' as const,
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center' as const,
          },
        },
        style: {
          backgroundColor: '#f3f4f6',
          padding: { top: 16, right: 16, bottom: 16, left: 16 },
        },
      };

    case 'text':
      return {
        ...baseElement,
        type: 'text',
        size: { width: 300, height: 80 },
        content: {
          text: 'Teks baru. Klik untuk edit.',
          richText: false,
        },
        style: {
          fontSize: 14,
          fontWeight: 'normal' as const,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left' as const,
          lineHeight: 1.5,
        },
      };

    case 'data-table':
      return {
        ...baseElement,
        type: 'data-table',
        size: { width: 600, height: 300 },
        dataBinding: {
          source: 'habit_tracker.ubudiyah',
        },
        columns: [
          {
            id: crypto.randomUUID(),
            header: 'Indikator',
            field: 'indikator',
            width: 'auto' as const,
            align: 'left' as const,
            format: 'text' as const,
          },
          {
            id: crypto.randomUUID(),
            header: 'Nilai',
            field: 'nilai',
            width: 100,
            align: 'center' as const,
            format: 'number' as const,
          },
        ],
        style: {
          headerBackgroundColor: '#3b82f6',
          headerTextColor: '#ffffff',
          headerFontSize: 14,
          headerFontWeight: 'bold' as const,
          rowBackgroundColor: '#ffffff',
          rowAlternateColor: '#f9fafb',
          rowTextColor: '#000000',
          rowFontSize: 12,
          borderColor: '#d1d5db',
          borderWidth: 1,
          cellPadding: 8,
        },
        options: {
          showHeader: true,
          showBorders: true,
          alternateRows: true,
        },
      };

    case 'image':
      return {
        ...baseElement,
        type: 'image',
        size: { width: 200, height: 200 },
        content: {
          source: 'url' as const,
          value: '',
          fit: 'cover' as const,
        },
        style: {
          borderRadius: 8,
        },
      };

    case 'image-gallery':
      return {
        ...baseElement,
        type: 'image-gallery',
        size: { width: 600, height: 400 },
        dataBinding: {
          source: 'galeri_kegiatan' as const,
          maxImages: 6,
          sortBy: 'date' as const,
        },
        layout: {
          type: 'grid' as const,
          columns: 3,
          gap: 8,
        },
        imageStyle: {
          width: 180,
          height: 120,
          fit: 'cover' as const,
          borderRadius: 4,
        },
        options: {
          showCaptions: false,
          captionPosition: 'below' as const,
        },
      };

    case 'signature':
      return {
        ...baseElement,
        type: 'signature',
        size: { width: 200, height: 100 },
        content: {
          label: 'Pembina Asrama',
          showLine: true,
          showDate: true,
        },
        style: {
          fontSize: 12,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'center' as const,
          lineColor: '#000000',
          lineWidth: 1,
        },
      };

    case 'line':
      return {
        ...baseElement,
        type: 'line',
        size: { width: 400, height: 2 },
        style: {
          color: '#000000',
          width: 2,
          style: 'solid' as const,
        },
      };

    default:
      return baseElement as TemplateElement;
  }
}

function Canvas({ zoom }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { templateConfig, addElement, clearSelection, elements: storeElements } = useTemplateBuilderStore();
  
  // Sort elements by z-index with useMemo to prevent infinite loop
  const elements = useMemo(() => {
    return [...storeElements].sort((a, b) => a.zIndex - b.zIndex);
  }, [storeElements]);

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('Drag ended', { activeId: active.id, overId: over?.id, data: active.data.current });

    // Check if dropped on canvas
    if (over?.id === 'canvas-droppable') {
      const elementType = active.data.current?.type as ElementType;
      
      if (!elementType) {
        console.error('No element type found in drag data');
        return;
      }

      // Get drop position relative to canvas
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) {
        console.error('Canvas ref not available');
        return;
      }

      // Calculate position accounting for zoom
      const activatorEvent = event.activatorEvent as MouseEvent;
      const dropX = activatorEvent.clientX - canvasRect.left;
      const dropY = activatorEvent.clientY - canvasRect.top;

      // Adjust for zoom
      const scaleFactor = zoom / 100;
      const actualX = dropX / scaleFactor;
      const actualY = dropY / scaleFactor;

      // Create new element at drop position
      const newElement = createDefaultElement(elementType, {
        x: Math.max(0, actualX - 100), // Center element on cursor
        y: Math.max(0, actualY - 50),
      });

      // Set z-index to be on top
      newElement.zIndex = elements.length;

      console.log('Adding element', newElement);
      addElement(newElement);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Clear selection if clicking on canvas background
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  if (!templateConfig) return null;

  const scaleFactor = zoom / 100;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-full flex items-center justify-center p-8">
        <div
          className="relative bg-white shadow-2xl"
          style={{
            width: A4_WIDTH_PX * scaleFactor,
            height: A4_HEIGHT_PX * scaleFactor,
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Canvas background */}
          <div
            ref={(node) => {
              canvasRef.current = node;
              setNodeRef(node);
            }}
            onClick={handleCanvasClick}
            className="absolute inset-0"
            style={{
              backgroundColor: templateConfig.backgroundColor || '#ffffff',
              width: A4_WIDTH_PX,
              height: A4_HEIGHT_PX,
            }}
          >
            {/* Render all elements */}
            {elements.map((element) => (
              <DraggableElement key={element.id} element={element} />
            ))}

            {/* Empty state */}
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <p className="text-lg font-medium mb-2">Canvas Kosong</p>
                  <p className="text-sm">
                    Drag komponen dari sidebar untuk mulai mendesain
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Page border */}
          <div
            className="absolute inset-0 border border-gray-300 pointer-events-none"
            style={{
              width: A4_WIDTH_PX,
              height: A4_HEIGHT_PX,
            }}
          />
        </div>
      </div>
    </DndContext>
  );
}

// Memoize Canvas to prevent unnecessary re-renders
// Only re-render when zoom or template config changes
export default memo(Canvas);
