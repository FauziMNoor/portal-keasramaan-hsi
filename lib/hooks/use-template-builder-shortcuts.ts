import { useEffect } from 'react';
import { useTemplateBuilderStore } from '@/lib/stores/template-builder-store';

/**
 * Keyboard shortcuts for Template Builder
 * 
 * Shortcuts:
 * - Delete/Backspace: Delete selected element
 * - Ctrl/Cmd + Z: Undo
 * - Ctrl/Cmd + Shift + Z: Redo
 * - Ctrl/Cmd + D: Duplicate selected element
 * - Escape: Clear selection
 */
export function useTemplateBuilderShortcuts() {
  const {
    selectedElementId,
    deleteElement,
    undo,
    redo,
    canUndo,
    canRedo,
    duplicateElement,
    clearSelection,
  } = useTemplateBuilderStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Don't trigger shortcuts when typing in input fields
      if (isInputField) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // Delete selected element (Delete or Backspace)
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedElementId
      ) {
        event.preventDefault();
        deleteElement(selectedElementId);
        return;
      }

      // Undo (Ctrl/Cmd + Z)
      if (ctrlOrCmd && event.key === 'z' && !event.shiftKey) {
        if (canUndo()) {
          event.preventDefault();
          undo();
        }
        return;
      }

      // Redo (Ctrl/Cmd + Shift + Z)
      if (ctrlOrCmd && event.key === 'z' && event.shiftKey) {
        if (canRedo()) {
          event.preventDefault();
          redo();
        }
        return;
      }

      // Duplicate element (Ctrl/Cmd + D)
      if (ctrlOrCmd && event.key === 'd' && selectedElementId) {
        event.preventDefault();
        duplicateElement(selectedElementId);
        return;
      }

      // Clear selection (Escape)
      if (event.key === 'Escape') {
        event.preventDefault();
        clearSelection();
        return;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedElementId,
    deleteElement,
    undo,
    redo,
    canUndo,
    canRedo,
    duplicateElement,
    clearSelection,
  ]);
}
