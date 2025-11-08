/**
 * Validation utilities for Rapor module
 */

// File upload validation constants
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB (for kegiatan photos)
  MAX_SIZE_COVER: 10 * 1024 * 1024, // 10MB (for cover images)
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
} as const;

// Validation error types
export type ValidationError = {
  field: string;
  message: string;
};

export type FileValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Validate file upload (size and type)
 */
export function validateFileUpload(file: File): FileValidationResult {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan' };
  }

  // Check file size
  if (file.size > FILE_UPLOAD_LIMITS.MAX_SIZE) {
    const maxSizeMB = FILE_UPLOAD_LIMITS.MAX_SIZE / (1024 * 1024);
    return { valid: false, error: `Ukuran file maksimal ${maxSizeMB}MB` };
  }

  // Check file type
  if (!FILE_UPLOAD_LIMITS.ALLOWED_TYPES.includes(file.type as any)) {
    return { 
      valid: false, 
      error: `Tipe file harus ${FILE_UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ').toUpperCase()}` 
    };
  }

  // Check file extension
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!fileExt || !FILE_UPLOAD_LIMITS.ALLOWED_EXTENSIONS.includes(fileExt as any)) {
    return { 
      valid: false, 
      error: `Ekstensi file harus ${FILE_UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ').toUpperCase()}` 
    };
  }

  return { valid: true };
}

/**
 * Validate multiple file uploads
 */
export function validateMultipleFiles(files: File[]): {
  valid: boolean;
  errors: Array<{ file: string; error: string }>;
} {
  const errors: Array<{ file: string; error: string }> = [];

  for (const file of files) {
    const result = validateFileUpload(file);
    if (!result.valid && result.error) {
      errors.push({ file: file.name, error: result.error });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate kegiatan form data
 */
export function validateKegiatanForm(data: {
  nama_kegiatan?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  tahun_ajaran?: string;
  semester?: string;
  scope?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.nama_kegiatan || data.nama_kegiatan.trim().length === 0) {
    errors.push({ field: 'nama_kegiatan', message: 'Nama kegiatan wajib diisi' });
  }

  if (!data.tanggal_mulai) {
    errors.push({ field: 'tanggal_mulai', message: 'Tanggal mulai wajib diisi' });
  }

  if (!data.tanggal_selesai) {
    errors.push({ field: 'tanggal_selesai', message: 'Tanggal selesai wajib diisi' });
  }

  if (data.tanggal_mulai && data.tanggal_selesai) {
    const mulai = new Date(data.tanggal_mulai);
    const selesai = new Date(data.tanggal_selesai);
    if (mulai > selesai) {
      errors.push({ 
        field: 'tanggal_selesai', 
        message: 'Tanggal selesai harus setelah tanggal mulai' 
      });
    }
  }

  if (!data.tahun_ajaran || data.tahun_ajaran.trim().length === 0) {
    errors.push({ field: 'tahun_ajaran', message: 'Tahun ajaran wajib diisi' });
  }

  if (!data.semester || data.semester.trim().length === 0) {
    errors.push({ field: 'semester', message: 'Semester wajib diisi' });
  }

  if (!data.scope || data.scope.trim().length === 0) {
    errors.push({ field: 'scope', message: 'Scope kegiatan wajib diisi' });
  }

  const validScopes = [
    'seluruh_sekolah',
    'kelas_10',
    'kelas_11',
    'kelas_12',
    'asrama_putra',
    'asrama_putri',
  ];
  if (data.scope && !validScopes.includes(data.scope)) {
    errors.push({ field: 'scope', message: 'Scope kegiatan tidak valid' });
  }

  return errors;
}

/**
 * Validate template rapor form data
 */
export function validateTemplateForm(data: {
  nama_template?: string;
  jenis_rapor?: string;
  ukuran_kertas_default?: string;
  orientasi_default?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.nama_template || data.nama_template.trim().length === 0) {
    errors.push({ field: 'nama_template', message: 'Nama template wajib diisi' });
  }

  if (!data.jenis_rapor || data.jenis_rapor.trim().length === 0) {
    errors.push({ field: 'jenis_rapor', message: 'Jenis rapor wajib diisi' });
  }

  const validJenisRapor = ['semester', 'bulanan', 'tahunan'];
  if (data.jenis_rapor && !validJenisRapor.includes(data.jenis_rapor)) {
    errors.push({ field: 'jenis_rapor', message: 'Jenis rapor tidak valid' });
  }

  const validUkuranKertas = ['A5', 'A4', 'Letter', 'F4'];
  if (data.ukuran_kertas_default && !validUkuranKertas.includes(data.ukuran_kertas_default)) {
    errors.push({ field: 'ukuran_kertas_default', message: 'Ukuran kertas tidak valid' });
  }

  const validOrientasi = ['portrait', 'landscape'];
  if (data.orientasi_default && !validOrientasi.includes(data.orientasi_default)) {
    errors.push({ field: 'orientasi_default', message: 'Orientasi tidak valid' });
  }

  return errors;
}

/**
 * Validate kategori indikator form data
 */
export function validateKategoriIndikatorForm(data: {
  nama_kategori?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.nama_kategori || data.nama_kategori.trim().length === 0) {
    errors.push({ field: 'nama_kategori', message: 'Nama kategori wajib diisi' });
  }

  return errors;
}

/**
 * Validate indikator form data
 */
export function validateIndikatorForm(data: {
  kategori_id?: string;
  nama_indikator?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.kategori_id || data.kategori_id.trim().length === 0) {
    errors.push({ field: 'kategori_id', message: 'Kategori wajib dipilih' });
  }

  if (!data.nama_indikator || data.nama_indikator.trim().length === 0) {
    errors.push({ field: 'nama_indikator', message: 'Nama indikator wajib diisi' });
  }

  return errors;
}

/**
 * Validate capaian siswa form data
 */
export function validateCapaianForm(data: {
  siswa_nis?: string;
  indikator_id?: string;
  tahun_ajaran?: string;
  semester?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.siswa_nis || data.siswa_nis.trim().length === 0) {
    errors.push({ field: 'siswa_nis', message: 'Siswa wajib dipilih' });
  }

  if (!data.indikator_id || data.indikator_id.trim().length === 0) {
    errors.push({ field: 'indikator_id', message: 'Indikator wajib dipilih' });
  }

  if (!data.tahun_ajaran || data.tahun_ajaran.trim().length === 0) {
    errors.push({ field: 'tahun_ajaran', message: 'Tahun ajaran wajib diisi' });
  }

  if (!data.semester || data.semester.trim().length === 0) {
    errors.push({ field: 'semester', message: 'Semester wajib diisi' });
  }

  return errors;
}

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(e => `${e.field}: ${e.message}`).join(', ');
}
