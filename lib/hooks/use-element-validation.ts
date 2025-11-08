/**
 * Hook for element validation in Template Builder
 */

import { useMemo } from 'react';
import { useTemplateBuilderStore } from '@/lib/stores/template-builder-store';
import {
  validateElement,
  validateAllElements,
  getValidationSummary,
  type ElementValidationResult,
} from '@/lib/rapor/element-validator';

/**
 * Hook to validate a specific element
 * 
 * @param elementId - ID of element to validate
 * @returns Validation result for the element
 */
export function useElementValidation(elementId: string | null): ElementValidationResult | null {
  const elements = useTemplateBuilderStore((state) => state.elements);
  const templateConfig = useTemplateBuilderStore((state) => state.templateConfig);
  
  return useMemo(() => {
    if (!elementId || !templateConfig) return null;
    
    const element = elements.find((el) => el.id === elementId);
    if (!element) return null;
    
    return validateElement(element, templateConfig.dimensions);
  }, [elementId, elements, templateConfig]);
}

/**
 * Hook to validate all elements in the template
 * 
 * @returns Map of element ID to validation result
 */
export function useAllElementsValidation(): Map<string, ElementValidationResult> {
  const elements = useTemplateBuilderStore((state) => state.elements);
  const templateConfig = useTemplateBuilderStore((state) => state.templateConfig);
  
  return useMemo(() => {
    if (!templateConfig) return new Map();
    
    return validateAllElements(elements, templateConfig.dimensions);
  }, [elements, templateConfig]);
}

/**
 * Hook to get validation summary for all elements
 * 
 * @returns Validation summary with counts
 */
export function useValidationSummary() {
  const validationResults = useAllElementsValidation();
  
  return useMemo(() => {
    return getValidationSummary(validationResults);
  }, [validationResults]);
}

/**
 * Hook to check if selected element has validation errors
 * 
 * @returns True if selected element has errors
 */
export function useSelectedElementHasErrors(): boolean {
  const selectedElementId = useTemplateBuilderStore((state) => state.selectedElementId);
  const validation = useElementValidation(selectedElementId);
  
  return validation ? !validation.valid : false;
}

/**
 * Hook to get validation errors for selected element
 * 
 * @returns Array of validation errors
 */
export function useSelectedElementErrors() {
  const selectedElementId = useTemplateBuilderStore((state) => state.selectedElementId);
  const validation = useElementValidation(selectedElementId);
  
  return validation?.errors || [];
}

/**
 * Hook to get validation warnings for selected element
 * 
 * @returns Array of validation warnings
 */
export function useSelectedElementWarnings() {
  const selectedElementId = useTemplateBuilderStore((state) => state.selectedElementId);
  const validation = useElementValidation(selectedElementId);
  
  return validation?.warnings || [];
}
