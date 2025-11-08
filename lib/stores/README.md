# Template Builder Store

This directory contains the Zustand store for the Template Builder feature.

## Overview

The Template Builder Store manages the state for the drag-and-drop template editor, including:
- Template configuration
- Elements array
- Element selection
- Undo/redo history (up to 50 actions)
- Dirty state tracking

## Usage

### Basic Store Usage

```typescript
import { useTemplateBuilderStore } from '@/lib/stores/template-builder-store';

function MyComponent() {
  const { 
    elements, 
    selectedElementId,
    addElement,
    updateElement,
    deleteElement 
  } = useTemplateBuilderStore();

  // Use the store...
}
```

### Using Selectors (Optimized)

For better performance, use the provided selectors:

```typescript
import { 
  useSelectedElement,
  useSortedElements,
  useElement,
  useIsElementSelected 
} from '@/lib/stores/template-builder-store';

function ElementProperties() {
  // Only re-renders when selected element changes
  const selectedElement = useSelectedElement();
  
  if (!selectedElement) return <div>No element selected</div>;
  
  return <div>{selectedElement.type}</div>;
}
```

### Using Hooks

#### Keyboard Shortcuts

```typescript
import { useTemplateBuilderShortcuts } from '@/lib/hooks';

function TemplateBuilder() {
  // Automatically handles keyboard shortcuts
  useTemplateBuilderShortcuts();
  
  return <div>...</div>;
}
```

Available shortcuts:
- `Delete` or `Backspace`: Delete selected element
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + D`: Duplicate selected element
- `Escape`: Clear selection

#### Element Selection

```typescript
import { useElementSelection } from '@/lib/hooks';

function Canvas() {
  const {
    selectedElement,
    select,
    deleteSelected,
    moveSelected,
    resizeSelected,
    duplicateSelected,
  } = useElementSelection();

  const handleClick = (elementId: string) => {
    select(elementId);
  };

  return <div>...</div>;
}
```

## Store Actions

### Template Actions

- `setTemplateConfig(config)`: Set the entire template configuration
- `updateTemplateConfig(updates)`: Update specific template config fields

### Element Actions

- `addElement(element)`: Add a new element to the canvas
- `updateElement(id, updates)`: Update an element's properties
- `deleteElement(id)`: Remove an element
- `reorderElements(elementIds)`: Change z-index order of elements
- `moveElement(id, position)`: Move an element to a new position
- `resizeElement(id, size)`: Resize an element
- `duplicateElement(id)`: Create a copy of an element

### Selection Actions

- `selectElement(id)`: Select an element (or null to deselect)
- `selectMultipleElements(ids)`: Select multiple elements (future feature)
- `clearSelection()`: Deselect all elements

### History Actions

- `undo()`: Undo the last action
- `redo()`: Redo the last undone action
- `canUndo()`: Check if undo is available
- `canRedo()`: Check if redo is available
- `clearHistory()`: Clear all history

### State Management Actions

- `setElements(elements)`: Set all elements at once (for loading)
- `reset()`: Reset store to initial state
- `markClean()`: Mark the template as saved (no unsaved changes)
- `setLoading(loading)`: Set loading state

## History System

The store maintains a history of up to 50 actions for undo/redo functionality. Each action that modifies the template or elements is automatically added to the history.

Supported action types:
- `ADD_ELEMENT`
- `UPDATE_ELEMENT`
- `DELETE_ELEMENT`
- `REORDER_ELEMENTS`
- `MOVE_ELEMENT`
- `RESIZE_ELEMENT`
- `UPDATE_TEMPLATE_CONFIG`

## State Structure

```typescript
interface TemplateBuilderState {
  // Template data
  templateConfig: TemplateConfig | null;
  elements: TemplateElement[];
  
  // Selection state
  selectedElementId: string | null;
  selectedElementIds: string[]; // For future multi-select
  
  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  maxHistorySize: number; // 50
  
  // UI state
  isDirty: boolean; // Has unsaved changes
  isLoading: boolean;
}
```

## Best Practices

1. **Use selectors for derived state**: Instead of accessing `elements` directly, use `useSortedElements()` or `useSelectedElement()` to avoid unnecessary re-renders.

2. **Check dirty state before navigation**: Use `isDirty` to warn users about unsaved changes.

3. **Clear history after save**: Call `markClean()` after successfully saving to reset the dirty flag.

4. **Use keyboard shortcuts hook**: Always include `useTemplateBuilderShortcuts()` in your main builder component for consistent UX.

5. **Batch updates**: When making multiple changes, consider if they should be separate history entries or combined.

## Example: Complete Template Builder Component

```typescript
import { useTemplateBuilderStore } from '@/lib/stores/template-builder-store';
import { useTemplateBuilderShortcuts, useElementSelection } from '@/lib/hooks';

function TemplateBuilder() {
  const { 
    templateConfig, 
    elements, 
    isDirty,
    undo,
    redo,
    canUndo,
    canRedo 
  } = useTemplateBuilderStore();
  
  const { selectedElement, select } = useElementSelection();
  
  // Enable keyboard shortcuts
  useTemplateBuilderShortcuts();

  return (
    <div>
      <Toolbar>
        <button onClick={undo} disabled={!canUndo()}>Undo</button>
        <button onClick={redo} disabled={!canRedo()}>Redo</button>
        {isDirty && <span>Unsaved changes</span>}
      </Toolbar>
      
      <Canvas elements={elements} onSelectElement={select} />
      
      {selectedElement && (
        <PropertiesPanel element={selectedElement} />
      )}
    </div>
  );
}
```
