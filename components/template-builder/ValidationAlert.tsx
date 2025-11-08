/**
 * Validation Alert Component
 * 
 * Displays validation errors and warnings for template elements
 */

'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ValidationError } from '@/lib/rapor/element-validator';

interface ValidationAlertProps {
  errors?: ValidationError[];
  warnings?: ValidationError[];
  className?: string;
}

export function ValidationAlert({ errors = [], warnings = [], className = '' }: ValidationAlertProps) {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  
  if (!hasErrors && !hasWarnings) {
    return (
      <div className={`flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Validasi Berhasil</p>
          <p className="text-xs text-green-600 mt-0.5">Elemen tidak memiliki error</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Errors */}
      {hasErrors && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-1">
              {errors.length} Error{errors.length > 1 ? 's' : ''}
            </p>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-xs text-red-700">
                  <span className="font-medium">{error.field}:</span> {error.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Warnings */}
      {hasWarnings && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 mb-1">
              {warnings.length} Peringatan
            </p>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-xs text-yellow-700">
                  <span className="font-medium">{warning.field}:</span> {warning.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact validation badge for showing validation status
 */
interface ValidationBadgeProps {
  errorCount: number;
  warningCount: number;
  className?: string;
}

export function ValidationBadge({ errorCount, warningCount, className = '' }: ValidationBadgeProps) {
  if (errorCount === 0 && warningCount === 0) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded ${className}`}>
        <CheckCircle className="w-3 h-3" />
        Valid
      </span>
    );
  }
  
  if (errorCount > 0) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded ${className}`}>
        <AlertCircle className="w-3 h-3" />
        {errorCount} Error{errorCount > 1 ? 's' : ''}
      </span>
    );
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded ${className}`}>
      <AlertTriangle className="w-3 h-3" />
      {warningCount} Peringatan
    </span>
  );
}

/**
 * Validation summary for showing overall template validation status
 */
interface ValidationSummaryProps {
  totalElements: number;
  validElements: number;
  invalidElements: number;
  totalErrors: number;
  totalWarnings: number;
  className?: string;
}

export function ValidationSummary({
  totalElements,
  validElements,
  invalidElements,
  totalErrors,
  totalWarnings,
  className = '',
}: ValidationSummaryProps) {
  const isValid = invalidElements === 0;
  
  return (
    <div className={`p-4 border rounded-lg ${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {isValid ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600" />
        )}
        <h3 className={`text-sm font-semibold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
          {isValid ? 'Template Valid' : 'Template Memiliki Error'}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-600">Total Elemen</p>
          <p className="text-lg font-semibold text-gray-900">{totalElements}</p>
        </div>
        <div>
          <p className="text-gray-600">Elemen Valid</p>
          <p className="text-lg font-semibold text-green-600">{validElements}</p>
        </div>
        {invalidElements > 0 && (
          <div>
            <p className="text-gray-600">Elemen Error</p>
            <p className="text-lg font-semibold text-red-600">{invalidElements}</p>
          </div>
        )}
        {totalErrors > 0 && (
          <div>
            <p className="text-gray-600">Total Error</p>
            <p className="text-lg font-semibold text-red-600">{totalErrors}</p>
          </div>
        )}
        {totalWarnings > 0 && (
          <div>
            <p className="text-gray-600">Total Peringatan</p>
            <p className="text-lg font-semibold text-yellow-600">{totalWarnings}</p>
          </div>
        )}
      </div>
    </div>
  );
}
