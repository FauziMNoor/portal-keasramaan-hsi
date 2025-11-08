import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { throttle } from '@/lib/utils/performance';
import type {
  TemplateConfig,
  TemplateElement,
  Position,
  Size,
} from '@/types/rapor-builder';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Action types for undo/redo history
 */
type ActionType =
  | 'ADD_ELEMENT'
  | 'UPDATE_ELEMENT'
  | 'DELETE_ELEMENT'
  | 'REORDER_ELEMENTS'
  | 'MOVE_ELEMENT'
  | 'RESIZE_ELEMENT'
  | 'UPDATE_TEMPLATE_CONFIG';

/**
 * History entry for undo/redo
 */
interface HistoryEntry {
  type: ActionType;
  timestamp: number;
  previousState: {
    elements: TemplateElement[];
    templateConfig?: Partial<TemplateConfig>;
  };
  currentState: {
    elements: TemplateElement[];
    templateConfig?: Partial<TemplateConfig>;
  };
}

/**
 * Template Builder Store State
 */
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
  maxHistorySize: number;
  
  // UI state
  isDirty: boolean; // Has unsaved changes
  isLoading: boolean;
  
  // Actions - Template
  setTemplateConfig: (config: TemplateConfig) => void;
  updateTemplateConfig: (updates: Partial<TemplateConfig>) => void;
  
  // Actions - Elements
  addElement: (element: TemplateElement) => void;
  updateElement: (id: string, updates: Partial<TemplateElement>) => void;
  deleteElement: (id: string) => void;
  reorderElements: (elementIds: string[]) => void;
  moveElement: (id: string, position: Position) => void;
  resizeElement: (id: string, size: Size) => void;
  duplicateElement: (id: string) => void;
  
  // Actions - Selection
  selectElement: (id: string | null) => void;
  selectMultipleElements: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Actions - History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  
  // Actions - State management
  setElements: (elements: TemplateElement[]) => void;
  reset: () => void;
  markClean: () => void;
  setLoading: (loading: boolean) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  templateConfig: null,
  elements: [],
  selectedElementId: null,
  selectedElementIds: [],
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  isDirty: false,
  isLoading: false,
};

// ============================================================================
// STORE
// ============================================================================

export const useTemplateBuilderStore = create<TemplateBuilderState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ========================================================================
      // TEMPLATE ACTIONS
      // ========================================================================

      setTemplateConfig: (config: TemplateConfig) => {
        set({ templateConfig: config }, false, 'setTemplateConfig');
      },

      updateTemplateConfig: (updates: Partial<TemplateConfig>) => {
        const state = get();
        if (!state.templateConfig) return;

        const previousConfig = state.templateConfig;
        const newConfig = { ...previousConfig, ...updates };

        // Add to history
        const historyEntry: HistoryEntry = {
          type: 'UPDATE_TEMPLATE_CONFIG',
          timestamp: Date.now(),
          previousState: {
            elements: state.elements,
            templateConfig: previousConfig,
          },
          currentState: {
            elements: state.elements,
            templateConfig: newConfig,
          },
        };

        set(
          (state) => ({
            templateConfig: newConfig,
            isDirty: true,
            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              historyEntry,
            ].slice(-state.maxHistorySize),
            historyIndex: Math.min(
              state.historyIndex + 1,
              state.maxHistorySize - 1
            ),
          }),
          false,
          'updateTemplateConfig'
        );
      },

      // ========================================================================
      // ELEMENT ACTIONS
      // ========================================================================

      addElement: (element: TemplateElement) => {
        const state = get();
        const newElements = [...state.elements, element];

        // Add to history
        const historyEntry: HistoryEntry = {
          type: 'ADD_ELEMENT',
          timestamp: Date.now(),
          previousState: { elements: state.elements },
          currentState: { elements: newElements },
        };

        set(
          (state) => ({
            elements: newElements,
            selectedElementId: element.id,
            isDirty: true,
            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              historyEntry,
            ].slice(-state.maxHistorySize),
            historyIndex: Math.min(
              state.historyIndex + 1,
              state.maxHistorySize - 1
            ),
          }),
          false,
          'addElement'
        );
      },

      updateElement: (id: string, updates: Partial<TemplateElement>) => {
        const state = get();
        const elementIndex = state.elements.findIndex((el) => el.id === id);
        if (elementIndex === -1) return;

        const previousElements = state.elements;
        const newElements = [...state.elements];
        newElements[elementIndex] = {
          ...newElements[elementIndex],
          ...updates,
        } as any;

        // Add to history
        const historyEntry: HistoryEntry = {
          type: 'UPDATE_ELEMENT',
          timestamp: Date.now(),
          previousState: { elements: previousElements },
          currentState: { elements: newElements },
        };

        set(
          (state) => ({
            elements: newElements,
            isDirty: true,
            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              historyEntry,
            ].slice(-state.maxHistorySize),
            historyIndex: Math.min(
              state.historyIndex + 1,
              state.maxHistorySize - 1
            ),
          }),
          false,
          'updateElement'
        );
      },

      deleteElement: (id: string) => {
        const state = get();
        const previousElements = state.elements;
        const newElements = state.elements.filter((el) => el.id !== id);

        // Add to history
        const historyEntry: HistoryEntry = {
          type: 'DELETE_ELEMENT',
          timestamp: Date.now(),
          previousState: { elements: previousElements },
          currentState: { elements: newElements },
        };

        set(
          (state) => ({
            elements: newElements,
            selectedElementId:
              state.selectedElementId === id ? null : state.selectedElementId,
            isDirty: true,
            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              historyEntry,
            ].slice(-state.maxHistorySize),
            historyIndex: Math.min(
              state.historyIndex + 1,
              state.maxHistorySize - 1
            ),
          }),
          false,
          'deleteElement'
        );
      },

      reorderElements: (elementIds: string[]) => {
        const state = get();
        const previousElements = state.elements;

        // Create a map of element IDs to their new z-index
        const zIndexMap = new Map(elementIds.map((id, index) => [id, index]));

        // Sort elements by new z-index
        const newElements = [...state.elements].sort((a, b) => {
          const aIndex = zIndexMap.get(a.id) ?? a.zIndex;
          const bIndex = zIndexMap.get(b.id) ?? b.zIndex;
          return aIndex - bIndex;
        });

        // Update z-index values
        newElements.forEach((el, index) => {
          el.zIndex = index;
        });

        // Add to history
        const historyEntry: HistoryEntry = {
          type: 'REORDER_ELEMENTS',
          timestamp: Date.now(),
          previousState: { elements: previousElements },
          currentState: { elements: newElements },
        };

        set(
          (state) => ({
            elements: newElements,
            isDirty: true,
            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              historyEntry,
            ].slice(-state.maxHistorySize),
            historyIndex: Math.min(
              state.historyIndex + 1,
              state.maxHistorySize - 1
            ),
          }),
          false,
          'reorderElements'
        );
      },

      moveElement: throttle((id: string, position: Position) => {
        const state = get();
        const elementIndex = state.elements.findIndex((el) => el.id === id);
        if (elementIndex === -1) return;

        const previousElements = state.elements;
        const newElements = [...state.elements];
        newElements[elementIndex] = {
          ...newElements[elementIndex],
          position,
        };

        // Add to history
        const historyEntry: HistoryEntry = {
          type: 'MOVE_ELEMENT',
          timestamp: Date.now(),
          previousState: { elements: previousElements },
          currentState: { elements: newElements },
        };

        set(
          (state) => ({
            elements: newElements,
            isDirty: true,
            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              historyEntry,
            ].slice(-state.maxHistorySize),
            historyIndex: Math.min(
              state.historyIndex + 1,
              state.maxHistorySize - 1
            ),
          }),
          false,
          'moveElement'
        );
      }, 16), // Throttle to ~60fps

      resizeElement: throttle((id: string, size: Size) => {
        const state = get();
        const elementIndex = state.elements.findIndex((el) => el.id === id);
        if (elementIndex === -1) return;

        const previousElements = state.elements;
        const newElements = [...state.elements];
        newElements[elementIndex] = {
          ...newElements[elementIndex],
          size,
        };

        // Add to history
        const historyEntry: HistoryEntry = {
          type: 'RESIZE_ELEMENT',
          timestamp: Date.now(),
          previousState: { elements: previousElements },
          currentState: { elements: newElements },
        };

        set(
          (state) => ({
            elements: newElements,
            isDirty: true,
            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              historyEntry,
            ].slice(-state.maxHistorySize),
            historyIndex: Math.min(
              state.historyIndex + 1,
              state.maxHistorySize - 1
            ),
          }),
          false,
          'resizeElement'
        );
      }, 16), // Throttle to ~60fps

      duplicateElement: (id: string) => {
        const state = get();
        const element = state.elements.find((el) => el.id === id);
        if (!element) return;

        // Create a duplicate with a new ID and offset position
        const duplicate: TemplateElement = {
          ...element,
          id: crypto.randomUUID(),
          position: {
            x: element.position.x + 20,
            y: element.position.y + 20,
          },
          zIndex: Math.max(...state.elements.map((el) => el.zIndex), 0) + 1,
        };

        const newElements = [...state.elements, duplicate];

        // Add to history
        const historyEntry: HistoryEntry = {
          type: 'ADD_ELEMENT',
          timestamp: Date.now(),
          previousState: { elements: state.elements },
          currentState: { elements: newElements },
        };

        set(
          (state) => ({
            elements: newElements,
            selectedElementId: duplicate.id,
            isDirty: true,
            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              historyEntry,
            ].slice(-state.maxHistorySize),
            historyIndex: Math.min(
              state.historyIndex + 1,
              state.maxHistorySize - 1
            ),
          }),
          false,
          'duplicateElement'
        );
      },

      // ========================================================================
      // SELECTION ACTIONS
      // ========================================================================

      selectElement: (id: string | null) => {
        set(
          {
            selectedElementId: id,
            selectedElementIds: id ? [id] : [],
          },
          false,
          'selectElement'
        );
      },

      selectMultipleElements: (ids: string[]) => {
        set(
          {
            selectedElementIds: ids,
            selectedElementId: ids.length === 1 ? ids[0] : null,
          },
          false,
          'selectMultipleElements'
        );
      },

      clearSelection: () => {
        set(
          {
            selectedElementId: null,
            selectedElementIds: [],
          },
          false,
          'clearSelection'
        );
      },

      // ========================================================================
      // HISTORY ACTIONS
      // ========================================================================

      undo: () => {
        const state = get();
        if (!state.canUndo()) return;

        const historyEntry = state.history[state.historyIndex];
        if (!historyEntry) return;

        set(
          {
            elements: historyEntry.previousState.elements,
            templateConfig: historyEntry.previousState.templateConfig
              ? {
                  ...state.templateConfig!,
                  ...historyEntry.previousState.templateConfig,
                }
              : state.templateConfig,
            historyIndex: state.historyIndex - 1,
            isDirty: true,
          },
          false,
          'undo'
        );
      },

      redo: () => {
        const state = get();
        if (!state.canRedo()) return;

        const historyEntry = state.history[state.historyIndex + 1];
        if (!historyEntry) return;

        set(
          {
            elements: historyEntry.currentState.elements,
            templateConfig: historyEntry.currentState.templateConfig
              ? {
                  ...state.templateConfig!,
                  ...historyEntry.currentState.templateConfig,
                }
              : state.templateConfig,
            historyIndex: state.historyIndex + 1,
            isDirty: true,
          },
          false,
          'redo'
        );
      },

      canUndo: () => {
        const state = get();
        return state.historyIndex >= 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      clearHistory: () => {
        set(
          {
            history: [],
            historyIndex: -1,
          },
          false,
          'clearHistory'
        );
      },

      // ========================================================================
      // STATE MANAGEMENT ACTIONS
      // ========================================================================

      setElements: (elements: TemplateElement[]) => {
        set({ elements }, false, 'setElements');
      },

      reset: () => {
        set(initialState, false, 'reset');
      },

      markClean: () => {
        set({ isDirty: false }, false, 'markClean');
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'setLoading');
      },
    }),
    { name: 'TemplateBuilderStore' }
  )
);

// ============================================================================
// SELECTORS (for optimized re-renders)
// ============================================================================

/**
 * Get selected element
 */
export const useSelectedElement = () =>
  useTemplateBuilderStore((state) => {
    if (!state.selectedElementId) return null;
    return state.elements.find((el) => el.id === state.selectedElementId);
  });

/**
 * Get elements (unsorted)
 * Use useMemo in component to sort if needed
 */
export const useElements = () =>
  useTemplateBuilderStore((state) => state.elements);

/**
 * Get element by ID
 */
export const useElement = (id: string) =>
  useTemplateBuilderStore((state) =>
    state.elements.find((el) => el.id === id)
  );

/**
 * Check if element is selected
 */
export const useIsElementSelected = (id: string) =>
  useTemplateBuilderStore((state) => state.selectedElementId === id);
