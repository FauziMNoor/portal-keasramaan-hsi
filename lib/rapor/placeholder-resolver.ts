/**
 * Placeholder Resolver Utility
 * 
 * This utility handles parsing and resolving placeholders in template text.
 * Placeholders follow the format: {{source.field}} or {{source.nested.field}}
 * 
 * Examples:
 * - {{siswa.nama}} -> "Ahmad Fauzi"
 * - {{habit_tracker.ubudiyah.average}} -> "2.8"
 * - {{school.nama}} -> "HSI Boarding School"
 */

/**
 * Extract all placeholders from text
 * Returns array of placeholder strings without the {{ }} wrapper
 * 
 * @param text - Text containing placeholders
 * @returns Array of placeholder paths (e.g., ["siswa.nama", "habit_tracker.ubudiyah.average"])
 */
export function extractPlaceholders(text: string): string[] {
  const pattern = /\{\{([^}]+)\}\}/g;
  const matches = text.matchAll(pattern);
  return Array.from(matches, (m) => m[1].trim());
}

/**
 * Resolve a single placeholder path to its value in the data object
 * Handles nested objects using dot notation
 * 
 * @param path - Placeholder path (e.g., "siswa.nama" or "habit_tracker.ubudiyah.average")
 * @param data - Data object containing all available data
 * @returns Resolved value or null if not found
 */
export function resolvePlaceholder(path: string, data: any): any {
  if (!path || !data) return null;

  const parts = path.split('.');
  let current = data;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return null;
    }

    if (typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
}

/**
 * Replace all placeholders in text with actual data values
 * 
 * @param text - Text containing placeholders
 * @param data - Data object containing all available data
 * @param options - Options for placeholder resolution
 * @returns Text with placeholders replaced by actual values
 */
export function replacePlaceholders(
  text: string,
  data: any,
  options: {
    keepPlaceholderOnMissing?: boolean; // If true, keep {{placeholder}} when data is missing
    defaultValue?: string; // Default value to use when data is missing
    formatNumber?: boolean; // If true, format numbers with locale
  } = {}
): string {
  const {
    keepPlaceholderOnMissing = false,
    defaultValue = '',
    formatNumber = true,
  } = options;

  return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder) => {
    const trimmedPlaceholder = placeholder.trim();
    const value = resolvePlaceholder(trimmedPlaceholder, data);

    // Handle missing data
    if (value === null || value === undefined) {
      if (keepPlaceholderOnMissing) {
        return match; // Keep original {{placeholder}}
      }
      return defaultValue;
    }

    // Format the value based on type
    return formatValue(value, formatNumber);
  });
}

/**
 * Format a value for display
 * 
 * @param value - Value to format
 * @param formatNumber - Whether to format numbers
 * @returns Formatted string
 */
function formatValue(value: any, formatNumber: boolean): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle numbers
  if (typeof value === 'number') {
    if (formatNumber) {
      // Format with 1 decimal place if it has decimals, otherwise no decimals
      if (Number.isInteger(value)) {
        return value.toString();
      }
      return value.toFixed(1);
    }
    return value.toString();
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'Ya' : 'Tidak';
  }

  // Handle dates
  if (value instanceof Date) {
    return value.toLocaleDateString('id-ID');
  }

  // Handle arrays (join with comma)
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Handle objects (convert to JSON string)
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  // Default: convert to string
  return String(value);
}

/**
 * Validate that all placeholders in text reference valid fields in the data schema
 * 
 * @param text - Text containing placeholders
 * @param validPaths - Array of valid placeholder paths
 * @returns Object with validation result and list of invalid placeholders
 */
export function validatePlaceholders(
  text: string,
  validPaths: string[]
): { valid: boolean; invalidPlaceholders: string[] } {
  const placeholders = extractPlaceholders(text);
  const invalidPlaceholders = placeholders.filter(
    (placeholder) => !validPaths.includes(placeholder)
  );

  return {
    valid: invalidPlaceholders.length === 0,
    invalidPlaceholders,
  };
}

/**
 * Get all valid placeholder paths from a data schema
 * Recursively traverses the schema to build a flat list of paths
 * 
 * @param schema - Data schema object
 * @param prefix - Current path prefix (used for recursion)
 * @returns Array of valid placeholder paths
 */
export function getValidPlaceholderPaths(
  schema: any,
  prefix: string = ''
): string[] {
  const paths: string[] = [];

  if (!schema || typeof schema !== 'object') {
    return paths;
  }

  for (const key in schema) {
    const value = schema[key];
    const currentPath = prefix ? `${prefix}.${key}` : key;

    // If value is a primitive or has a 'type' field, it's a leaf node
    if (
      typeof value !== 'object' ||
      value === null ||
      'type' in value ||
      'description' in value
    ) {
      paths.push(currentPath);
    } else if ('fields' in value) {
      // If it has a 'fields' property, recurse into it
      paths.push(...getValidPlaceholderPaths(value.fields, currentPath));
    } else {
      // Otherwise, recurse into the object
      paths.push(...getValidPlaceholderPaths(value, currentPath));
    }
  }

  return paths;
}

/**
 * Check if a placeholder pattern is valid (matches the expected format)
 * 
 * @param placeholder - Placeholder string (without {{ }})
 * @returns True if the placeholder format is valid
 */
export function isValidPlaceholderFormat(placeholder: string): boolean {
  // Check if placeholder matches pattern: word.word or word.word.word etc.
  const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$/;
  return pattern.test(placeholder);
}

/**
 * Replace placeholders in an object recursively
 * Useful for replacing placeholders in complex template configurations
 * 
 * @param obj - Object that may contain placeholders in string values
 * @param data - Data object containing all available data
 * @param options - Options for placeholder resolution
 * @returns New object with placeholders replaced
 */
export function replacePlaceholdersInObject(
  obj: any,
  data: any,
  options: {
    keepPlaceholderOnMissing?: boolean;
    defaultValue?: string;
    formatNumber?: boolean;
  } = {}
): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle strings
  if (typeof obj === 'string') {
    return replacePlaceholders(obj, data, options);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => replacePlaceholdersInObject(item, data, options));
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = replacePlaceholdersInObject(obj[key], data, options);
    }
    return result;
  }

  // Return primitives as-is
  return obj;
}

/**
 * Get a human-readable description of a placeholder
 * 
 * @param placeholder - Placeholder path
 * @returns Human-readable description
 */
export function getPlaceholderDescription(placeholder: string): string {
  const descriptions: Record<string, string> = {
    'siswa.nama': 'Nama siswa',
    'siswa.nis': 'Nomor Induk Siswa',
    'siswa.kelas': 'Kelas siswa',
    'siswa.asrama': 'Nama asrama',
    'siswa.cabang': 'Cabang/lokasi',
    'habit_tracker.ubudiyah.average': 'Rata-rata nilai Ubudiyah',
    'habit_tracker.ubudiyah.percentage': 'Persentase capaian Ubudiyah',
    'habit_tracker.akhlaq.average': 'Rata-rata nilai Akhlaq',
    'habit_tracker.akhlaq.percentage': 'Persentase capaian Akhlaq',
    'habit_tracker.kedisiplinan.average': 'Rata-rata nilai Kedisiplinan',
    'habit_tracker.kedisiplinan.percentage': 'Persentase capaian Kedisiplinan',
    'habit_tracker.kebersihan.average': 'Rata-rata nilai Kebersihan',
    'habit_tracker.kebersihan.percentage': 'Persentase capaian Kebersihan',
    'habit_tracker.overall_average': 'Rata-rata keseluruhan',
    'habit_tracker.overall_percentage': 'Persentase keseluruhan',
    'school.nama': 'Nama sekolah',
    'school.alamat': 'Alamat sekolah',
    'school.telepon': 'Nomor telepon sekolah',
    'pembina.nama': 'Nama pembina',
    'kepala_sekolah.nama': 'Nama kepala sekolah',
  };

  return descriptions[placeholder] || placeholder;
}

/**
 * Test if text contains any placeholders
 * 
 * @param text - Text to check
 * @returns True if text contains at least one placeholder
 */
export function hasPlaceholders(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

/**
 * Count the number of placeholders in text
 * 
 * @param text - Text to check
 * @returns Number of placeholders found
 */
export function countPlaceholders(text: string): number {
  return extractPlaceholders(text).length;
}
