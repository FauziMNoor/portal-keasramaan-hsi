/**
 * USAGE EXAMPLE - Template Builder Store
 * 
 * This file demonstrates how to use the Template Builder store and hooks
 * in a React component. This is for reference only and should not be
 * imported in production code.
 */

import React from 'react';
import { useTemplateBuilderStore } from './template-builder-store';
import { useTemplateBuilderShortcuts, useElementSelection } from '../hooks';
import type { TemplateElement, TextElement } from '@/types/rapor-builder';

/**
 * Example: Main Template Builder Component
 */
export function TemplateBuilderExample() {
  const {
    templateConfig,
    elements,
    isDirty,
    isLoading,
    undo,
    redo,
    canUndo,
    canRedo,
    addElement,
    setTemplateConfig,
  } = useTemplateBuilderStore();

  const { selectedElement, select, deleteSelected } = useElementSelection();

  // Enable keyboard shortcuts (Delete, Ctrl+Z, Ctrl+Shift+Z, Ctrl+D, Escape)
  useTemplateBuilderShortcuts();

  // Example: Add a text element
  const handleAddTextElement = () => {
    const newElement: TextElement = {
      id: crypto.randomUUID(),
      type: 'text',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      zIndex: elements.length,
      isVisible: true,
      isLocked: false,
      content: {
        text: 'New Text Element',
        richText: false,
      },
      style: {
        fontSize: 16,
        fontWeight: 'normal',
        fontFamily: 'Arial',
        color: '#000000',
        textAlign: 'left',
        lineHeight: 1.5,
      },
    };

    addElement(newElement);
  };

  // Example: Save template
  const handleSave = async () => {
    if (!templateConfig) return;

    try {
      // Call your API to save
      const response = await fetch(`/api/rapor/template/builder/${templateConfig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvas_config: templateConfig,
          elements: elements,
        }),
      });

      if (response.ok) {
        // Mark as clean after successful save
        useTemplateBuilderStore.getState().markClean();
        alert('Template saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    }
  };

  if (isLoading) {
    return <div>Loading template...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Toolbar */}
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Undo (Ctrl+Z)
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Redo (Ctrl+Shift+Z)
          </button>
          <button
            onClick={handleAddTextElement}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Add Text
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            Save {isDirty && '*'}
          </button>
          {selectedElement && (
            <button
              onClick={deleteSelected}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Delete (Del)
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-200 p-8 overflow-auto">
        <div
          className="bg-white shadow-lg mx-auto"
          style={{
            width: templateConfig?.dimensions.width || 794,
            height: templateConfig?.dimensions.height || 1123,
            position: 'relative',
          }}
        >
          {elements.map((element) => (
            <div
              key={element.id}
              onClick={() => select(element.id)}
              className={`absolute cursor-pointer border-2 ${
                selectedElement?.id === element.id
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                zIndex: element.zIndex,
              }}
            >
              {/* Render element content based on type */}
              {element.type === 'text' && (
                <div className="p-2">
                  {(element as TextElement).content.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-gray-100 p-4 border-l">
        <h3 className="font-bold mb-4">Properties</h3>
        {selectedElement ? (
          <div>
            <p>Type: {selectedElement.type}</p>
            <p>Position: ({selectedElement.position.x}, {selectedElement.position.y})</p>
            <p>Size: {selectedElement.size.width} x {selectedElement.size.height}</p>
            <p>Z-Index: {selectedElement.zIndex}</p>
          </div>
        ) : (
          <p className="text-gray-500">No element selected</p>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Using element selection hook
 */
export function ElementSelectionExample() {
  const {
    selectedElement,
    hasSelection,
    select,
    clear,
    deleteSelected,
    moveSelected,
    resizeSelected,
    duplicateSelected,
    moveSelectedBy,
    resizeSelectedBy,
  } = useElementSelection();

  return (
    <div>
      <h3>Element Selection Example</h3>
      
      {hasSelection ? (
        <div>
          <p>Selected: {selectedElement?.type}</p>
          <button onClick={clear}>Clear Selection (Esc)</button>
          <button onClick={deleteSelected}>Delete (Del)</button>
          <button onClick={duplicateSelected}>Duplicate (Ctrl+D)</button>
          
          {/* Move by arrow keys */}
          <div>
            <button onClick={() => moveSelectedBy(0, -10)}>↑</button>
            <button onClick={() => moveSelectedBy(-10, 0)}>←</button>
            <button onClick={() => moveSelectedBy(10, 0)}>→</button>
            <button onClick={() => moveSelectedBy(0, 10)}>↓</button>
          </div>
          
          {/* Resize */}
          <div>
            <button onClick={() => resizeSelectedBy(10, 0)}>Wider</button>
            <button onClick={() => resizeSelectedBy(-10, 0)}>Narrower</button>
            <button onClick={() => resizeSelectedBy(0, 10)}>Taller</button>
            <button onClick={() => resizeSelectedBy(0, -10)}>Shorter</button>
          </div>
        </div>
      ) : (
        <p>No element selected</p>
      )}
    </div>
  );
}

/**
 * Example: Loading a template from API
 */
export async function loadTemplateExample(templateId: string) {
  const store = useTemplateBuilderStore.getState();
  
  try {
    store.setLoading(true);
    
    // Fetch template from API
    const response = await fetch(`/api/rapor/template/builder/${templateId}`);
    const data = await response.json();
    
    if (data.success) {
      // Set template config and elements
      store.setTemplateConfig(data.data.template);
      store.setElements(data.data.elements);
      
      // Clear history and mark as clean (just loaded)
      store.clearHistory();
      store.markClean();
    }
  } catch (error) {
    console.error('Failed to load template:', error);
  } finally {
    store.setLoading(false);
  }
}

/**
 * Example: Checking for unsaved changes before navigation
 */
export function useUnsavedChangesWarning() {
  const isDirty = useTemplateBuilderStore((state) => state.isDirty);

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
