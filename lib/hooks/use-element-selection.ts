import { useCallback } from 'react';
import {
  useTemplateBuilderStore,
  useSelectedElement,
  useIsElementSelected,
} from '@/lib/stores/template-builder-store';
import type { Position, Size } from '@/types/rapor-builder';

/**
 * Hook for element selection and manipulation
 * Provides utilities for working with selected elements
 */
export function useElementSelection() {
  const {
    selectedElementId,
    selectElement,
    clearSelection,
    deleteElement,
    moveElement,
    resizeElement,
    duplicateElement,
    updateElement,
  } = useTemplateBuilderStore();

  const selectedElement = useSelectedElement();

  /**
   * Select an element by ID
   */
  const select = useCallback(
    (id: string | null) => {
      selectElement(id);
    },
    [selectElement]
  );

  /**
   * Toggle element selection
   */
  const toggle = useCallback(
    (id: string) => {
      if (selectedElementId === id) {
        clearSelection();
      } else {
        selectElement(id);
      }
    },
    [selectedElementId, selectElement, clearSelection]
  );

  /**
   * Delete the currently selected element
   */
  const deleteSelected = useCallback(() => {
    if (selectedElementId) {
      deleteElement(selectedElementId);
    }
  }, [selectedElementId, deleteElement]);

  /**
   * Move the currently selected element
   */
  const moveSelected = useCallback(
    (position: Position) => {
      if (selectedElementId) {
        moveElement(selectedElementId, position);
      }
    },
    [selectedElementId, moveElement]
  );

  /**
   * Resize the currently selected element
   */
  const resizeSelected = useCallback(
    (size: Size) => {
      if (selectedElementId) {
        resizeElement(selectedElementId, size);
      }
    },
    [selectedElementId, resizeElement]
  );

  /**
   * Duplicate the currently selected element
   */
  const duplicateSelected = useCallback(() => {
    if (selectedElementId) {
      duplicateElement(selectedElementId);
    }
  }, [selectedElementId, duplicateElement]);

  /**
   * Update properties of the currently selected element
   */
  const updateSelected = useCallback(
    (updates: any) => {
      if (selectedElementId) {
        updateElement(selectedElementId, updates);
      }
    },
    [selectedElementId, updateElement]
  );

  /**
   * Move element by delta (relative movement)
   */
  const moveSelectedBy = useCallback(
    (deltaX: number, deltaY: number) => {
      if (selectedElement) {
        moveElement(selectedElementId!, {
          x: selectedElement.position.x + deltaX,
          y: selectedElement.position.y + deltaY,
        });
      }
    },
    [selectedElement, selectedElementId, moveElement]
  );

  /**
   * Resize element by delta (relative resizing)
   */
  const resizeSelectedBy = useCallback(
    (deltaWidth: number, deltaHeight: number) => {
      if (selectedElement) {
        resizeElement(selectedElementId!, {
          width: Math.max(10, selectedElement.size.width + deltaWidth),
          height: Math.max(10, selectedElement.size.height + deltaHeight),
        });
      }
    },
    [selectedElement, selectedElementId, resizeElement]
  );

  /**
   * Check if an element is selected
   */
  const isSelected = useCallback(
    (id: string) => {
      return selectedElementId === id;
    },
    [selectedElementId]
  );

  return {
    // State
    selectedElementId,
    selectedElement,
    hasSelection: !!selectedElementId,

    // Selection actions
    select,
    toggle,
    clear: clearSelection,
    isSelected,

    // Manipulation actions
    deleteSelected,
    moveSelected,
    resizeSelected,
    duplicateSelected,
    updateSelected,
    moveSelectedBy,
    resizeSelectedBy,
  };
}

/**
 * Hook to check if a specific element is selected
 */
export function useIsSelected(id: string) {
  return useIsElementSelected(id);
}
