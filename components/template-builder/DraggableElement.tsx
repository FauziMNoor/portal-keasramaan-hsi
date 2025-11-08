'use client';

import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { useTemplateBuilderStore, useIsElementSelected } from '@/lib/stores/template-builder-store';
import type { TemplateElement } from '@/types/rapor-builder';
import {
  HeaderElementRenderer,
  TextElementRenderer,
  DataTableElementRenderer,
  ImageElementRenderer,
  ImageGalleryElementRenderer,
  SignatureElementRenderer,
  LineElementRenderer,
} from './element-renderers';

interface DraggableElementProps {
  element: TemplateElement;
}

type ResizeHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w';

const SNAP_GRID = 10; // Snap to 10px grid
const DEBOUNCE_DELAY = 16; // ~60fps for smooth updates

function DraggableElement({ element }: DraggableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    handle: '' as ResizeHandle,
  });
  
  // Debounce timer refs
  const dragDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const resizeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const {
    selectElement,
    moveElement,
    resizeElement,
    deleteElement,
    duplicateElement,
  } = useTemplateBuilderStore();

  const isSelected = useIsElementSelected(element.id);
  
  // Memoize callbacks to prevent unnecessary re-renders
  const handleSelectElement = useCallback(() => {
    selectElement(element.id);
  }, [element.id, selectElement]);
  
  const handleDeleteElement = useCallback(() => {
    deleteElement(element.id);
  }, [element.id, deleteElement]);
  
  const handleDuplicateElement = useCallback(() => {
    duplicateElement(element.id);
  }, [element.id, duplicateElement]);

  // Handle element click - memoized
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelectElement();
  }, [handleSelectElement]);

  // Handle drag start - memoized
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.isLocked) return;
    e.stopPropagation();

    handleSelectElement();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y,
    });
  }, [element.isLocked, element.position.x, element.position.y, handleSelectElement]);

  // Handle resize start - memoized
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    if (element.isLocked) return;
    e.stopPropagation();

    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.size.width,
      height: element.size.height,
      handle,
    });
  }, [element.isLocked, element.size.width, element.size.height]);

  // Handle mouse move (drag or resize) with debouncing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Clear previous debounce timer
        if (dragDebounceRef.current) {
          clearTimeout(dragDebounceRef.current);
        }
        
        // Debounce the update
        dragDebounceRef.current = setTimeout(() => {
          let newX = e.clientX - dragStart.x;
          let newY = e.clientY - dragStart.y;

          // Snap to grid
          newX = Math.round(newX / SNAP_GRID) * SNAP_GRID;
          newY = Math.round(newY / SNAP_GRID) * SNAP_GRID;

          // Keep within canvas bounds
          newX = Math.max(0, newX);
          newY = Math.max(0, newY);

          moveElement(element.id, { x: newX, y: newY });
        }, DEBOUNCE_DELAY);
      } else if (isResizing) {
        // Clear previous debounce timer
        if (resizeDebounceRef.current) {
          clearTimeout(resizeDebounceRef.current);
        }
        
        // Debounce the update
        resizeDebounceRef.current = setTimeout(() => {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = element.position.x;
        let newY = element.position.y;

        // Calculate new size based on handle
        switch (resizeStart.handle) {
          case 'nw':
            newWidth = resizeStart.width - deltaX;
            newHeight = resizeStart.height - deltaY;
            newX = element.position.x + deltaX;
            newY = element.position.y + deltaY;
            break;
          case 'n':
            newHeight = resizeStart.height - deltaY;
            newY = element.position.y + deltaY;
            break;
          case 'ne':
            newWidth = resizeStart.width + deltaX;
            newHeight = resizeStart.height - deltaY;
            newY = element.position.y + deltaY;
            break;
          case 'e':
            newWidth = resizeStart.width + deltaX;
            break;
          case 'se':
            newWidth = resizeStart.width + deltaX;
            newHeight = resizeStart.height + deltaY;
            break;
          case 's':
            newHeight = resizeStart.height + deltaY;
            break;
          case 'sw':
            newWidth = resizeStart.width - deltaX;
            newHeight = resizeStart.height + deltaY;
            newX = element.position.x + deltaX;
            break;
          case 'w':
            newWidth = resizeStart.width - deltaX;
            newX = element.position.x + deltaX;
            break;
        }

        // Snap to grid
        newWidth = Math.round(newWidth / SNAP_GRID) * SNAP_GRID;
        newHeight = Math.round(newHeight / SNAP_GRID) * SNAP_GRID;
        newX = Math.round(newX / SNAP_GRID) * SNAP_GRID;
        newY = Math.round(newY / SNAP_GRID) * SNAP_GRID;

        // Minimum size
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(30, newHeight);

        // Keep within canvas bounds
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);

          resizeElement(element.id, { width: newWidth, height: newHeight });
          if (newX !== element.position.x || newY !== element.position.y) {
            moveElement(element.id, { x: newX, y: newY });
          }
        }, DEBOUNCE_DELAY);
      }
    };

    const handleMouseUp = () => {
      // Clear any pending debounced updates
      if (dragDebounceRef.current) {
        clearTimeout(dragDebounceRef.current);
        dragDebounceRef.current = null;
      }
      if (resizeDebounceRef.current) {
        clearTimeout(resizeDebounceRef.current);
        resizeDebounceRef.current = null;
      }
      
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, element, moveElement, resizeElement]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteElement();
      }
      // Duplicate (Ctrl/Cmd + D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicateElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, handleDeleteElement, handleDuplicateElement]);

  // Render element content based on type using dedicated renderers
  const renderElementContent = () => {
    switch (element.type) {
      case 'header':
        return <HeaderElementRenderer element={element} />;
      case 'text':
        return <TextElementRenderer element={element} />;
      case 'data-table':
        return <DataTableElementRenderer element={element} />;
      case 'image':
        return <ImageElementRenderer element={element} />;
      case 'image-gallery':
        return <ImageGalleryElementRenderer element={element} />;
      case 'signature':
        return <SignatureElementRenderer element={element} />;
      case 'line':
        return <LineElementRenderer element={element} />;
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">Unknown Element</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute ${element.isLocked ? 'cursor-not-allowed' : 'cursor-move'} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        zIndex: element.zIndex,
        visibility: element.isVisible ? 'visible' : 'hidden',
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {renderElementContent()}

      {/* Resize handles - only show when selected and not locked - Touch-friendly larger size */}
      {isSelected && !element.isLocked && (
        <>
          {/* Corner handles - Larger for touch */}
          <div
            className="absolute -top-2 -left-2 w-6 h-6 sm:w-3 sm:h-3 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize touch-none"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              handleResizeStart(touch as any, 'nw');
            }}
          />
          <div
            className="absolute -top-2 -right-2 w-6 h-6 sm:w-3 sm:h-3 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize touch-none"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              handleResizeStart(touch as any, 'ne');
            }}
          />
          <div
            className="absolute -bottom-2 -left-2 w-6 h-6 sm:w-3 sm:h-3 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize touch-none"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              handleResizeStart(touch as any, 'sw');
            }}
          />
          <div
            className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-3 sm:h-3 bg-blue-500 border-2 border-white rounded-full cursor-se-resize touch-none"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              handleResizeStart(touch as any, 'se');
            }}
          />

          {/* Edge handles - Hidden on mobile for simplicity */}
          <div
            className="hidden sm:block absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-n-resize"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="hidden sm:block absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="hidden sm:block absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-w-resize"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="hidden sm:block absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
// Only re-render when element props change
export default memo(DraggableElement, (prevProps, nextProps) => {
  // Custom comparison: only re-render if element actually changed
  return (
    prevProps.element.id === nextProps.element.id &&
    prevProps.element.position.x === nextProps.element.position.x &&
    prevProps.element.position.y === nextProps.element.position.y &&
    prevProps.element.size.width === nextProps.element.size.width &&
    prevProps.element.size.height === nextProps.element.size.height &&
    prevProps.element.zIndex === nextProps.element.zIndex &&
    prevProps.element.isVisible === nextProps.element.isVisible &&
    prevProps.element.isLocked === nextProps.element.isLocked &&
    JSON.stringify((prevProps.element as any).content) === JSON.stringify((nextProps.element as any).content) &&
    JSON.stringify((prevProps.element as any).style) === JSON.stringify((nextProps.element as any).style)
  );
});
