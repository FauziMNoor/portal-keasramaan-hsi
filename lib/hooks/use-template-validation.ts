/**
 * Hook for template validation in Template Builder
 */

import { useMemo } from 'react';
import { useTemplateBuilderStore } from '@/lib/stores/template-builder-store';
import {
  validateTemplate,
  validateBeforeSave,
  validateBeforeGenerate,
  canSaveTemplate,
  canGeneratePDF,
  type TemplateValidationResult,
} from '@/lib/rapor/template-validator';

/**
 * Hook to validate the current template
 * 
 * @returns Validation result for the template
 */
export function useTemplateValidation(): TemplateValidationResult | null {
  const templateConfig = useTemplateBuilderStore((state) => state.templateConfig);
  const elements = useTemplateBuilderStore((state) => state.elements);
  
  return useMemo(() => {
    if (!templateConfig) return null;
    
    return validateTemplate(templateConfig, elements);
  }, [templateConfig, elements]);
}

/**
 * Hook to validate template before saving
 * 
 * @returns Validation result
 */
export function useValidateBeforeSave(): TemplateValidationResult | null {
  const templateConfig = useTemplateBuilderStore((state) => state.templateConfig);
  const elements = useTemplateBuilderStore((state) => state.elements);
  
  return useMemo(() => {
    if (!templateConfig) return null;
    
    return validateBeforeSave(templateConfig, elements);
  }, [templateConfig, elements]);
}

/**
 * Hook to validate template before PDF generation
 * 
 * @returns Validation result
 */
export function useValidateBeforeGenerate(): TemplateValidationResult | null {
  const templateConfig = useTemplateBuilderStore((state) => state.templateConfig);
  const elements = useTemplateBuilderStore((state) => state.elements);
  
  return useMemo(() => {
    if (!templateConfig) return null;
    
    return validateBeforeGenerate(templateConfig, elements);
  }, [templateConfig, elements]);
}

/**
 * Hook to check if template can be saved
 * 
 * @returns True if template can be saved
 */
export function useCanSaveTemplate(): boolean {
  const validation = useValidateBeforeSave();
  
  return validation ? canSaveTemplate(validation) : false;
}

/**
 * Hook to check if template can generate PDF
 * 
 * @returns True if template can generate PDF
 */
export function useCanGeneratePDF(): boolean {
  const validation = useValidateBeforeGenerate();
  
  return validation ? canGeneratePDF(validation) : false;
}

/**
 * Hook to get template validation errors
 * 
 * @returns Array of validation errors
 */
export function useTemplateValidationErrors() {
  const validation = useTemplateValidation();
  
  return validation?.errors || [];
}

/**
 * Hook to get template validation warnings
 * 
 * @returns Array of validation warnings
 */
export function useTemplateValidationWarnings() {
  const validation = useTemplateValidation();
  
  return validation?.warnings || [];
}

/**
 * Hook to check if template is valid
 * 
 * @returns True if template is valid
 */
export function useIsTemplateValid(): boolean {
  const validation = useTemplateValidation();
  
  return validation?.valid || false;
}
