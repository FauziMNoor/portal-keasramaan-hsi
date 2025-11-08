import { z } from 'zod';

// ============================================================================
// TEMPLATE CONFIGURATION
// ============================================================================

export const PageSizeSchema = z.enum(['A4', 'A5', 'Letter', 'F4']);
export type PageSize = z.infer<typeof PageSizeSchema>;

export const OrientationSchema = z.enum(['portrait', 'landscape']);
export type Orientation = z.infer<typeof OrientationSchema>;

export const DimensionsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});
export type Dimensions = z.infer<typeof DimensionsSchema>;

export const MarginsSchema = z.object({
  top: z.number().min(0),
  right: z.number().min(0),
  bottom: z.number().min(0),
  left: z.number().min(0),
});
export type Margins = z.infer<typeof MarginsSchema>;

export const TemplateMetadataSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  lastEditedBy: z.string(),
});
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;

export const TemplateConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.literal('builder'),
  version: z.string(),
  pageSize: PageSizeSchema,
  orientation: OrientationSchema,
  dimensions: DimensionsSchema,
  margins: MarginsSchema,
  backgroundColor: z.string(),
  metadata: TemplateMetadataSchema,
});
export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;

// ============================================================================
// BASE ELEMENT
// ============================================================================

export const ElementTypeSchema = z.enum([
  'header',
  'text',
  'data-table',
  'image',
  'image-gallery',
  'signature',
  'line',
  'shape',
]);
export type ElementType = z.infer<typeof ElementTypeSchema>;

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type Position = z.infer<typeof PositionSchema>;

export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});
export type Size = z.infer<typeof SizeSchema>;

export const BaseElementSchema = z.object({
  id: z.string().uuid(),
  type: ElementTypeSchema,
  position: PositionSchema,
  size: SizeSchema,
  zIndex: z.number().int(),
  isVisible: z.boolean(),
  isLocked: z.boolean(),
});
export type BaseElement = z.infer<typeof BaseElementSchema>;

// ============================================================================
// HEADER ELEMENT
// ============================================================================

export const LogoSourceSchema = z.enum(['upload', 'url', 'binding']);
export type LogoSource = z.infer<typeof LogoSourceSchema>;

export const LogoPositionSchema = z.enum(['left', 'center', 'right']);
export type LogoPosition = z.infer<typeof LogoPositionSchema>;

export const LogoConfigSchema = z.object({
  source: LogoSourceSchema,
  value: z.string(),
  size: SizeSchema,
  position: LogoPositionSchema,
});
export type LogoConfig = z.infer<typeof LogoConfigSchema>;

export const TextAlignSchema = z.enum(['left', 'center', 'right', 'justify']);
export type TextAlign = z.infer<typeof TextAlignSchema>;

export const FontWeightSchema = z.enum([
  'normal',
  'bold',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
]);
export type FontWeight = z.infer<typeof FontWeightSchema>;

export const TitleConfigSchema = z.object({
  text: z.string(),
  fontSize: z.number().positive(),
  fontWeight: FontWeightSchema,
  fontFamily: z.string(),
  color: z.string(),
  align: TextAlignSchema,
});
export type TitleConfig = z.infer<typeof TitleConfigSchema>;

export const SubtitleConfigSchema = z.object({
  text: z.string(),
  fontSize: z.number().positive(),
  color: z.string(),
});
export type SubtitleConfig = z.infer<typeof SubtitleConfigSchema>;

export const PaddingSchema = z.object({
  top: z.number().min(0),
  right: z.number().min(0),
  bottom: z.number().min(0),
  left: z.number().min(0),
});
export type Padding = z.infer<typeof PaddingSchema>;

export const HeaderContentSchema = z.object({
  logo: LogoConfigSchema.optional(),
  title: TitleConfigSchema,
  subtitle: SubtitleConfigSchema.optional(),
});
export type HeaderContent = z.infer<typeof HeaderContentSchema>;

export const HeaderStyleSchema = z.object({
  backgroundColor: z.string(),
  borderColor: z.string().optional(),
  borderWidth: z.number().min(0).optional(),
  borderRadius: z.number().min(0).optional(),
  padding: PaddingSchema,
});
export type HeaderStyle = z.infer<typeof HeaderStyleSchema>;

export const HeaderElementSchema = BaseElementSchema.extend({
  type: z.literal('header'),
  content: HeaderContentSchema,
  style: HeaderStyleSchema,
});
export type HeaderElement = z.infer<typeof HeaderElementSchema>;

// ============================================================================
// TEXT ELEMENT
// ============================================================================

export const TextContentSchema = z.object({
  text: z.string(),
  richText: z.boolean().optional(),
  html: z.string().optional(),
});
export type TextContent = z.infer<typeof TextContentSchema>;

export const TextStyleSchema = z.object({
  fontSize: z.number().positive(),
  fontWeight: FontWeightSchema,
  fontFamily: z.string(),
  color: z.string(),
  backgroundColor: z.string().optional(),
  textAlign: TextAlignSchema,
  lineHeight: z.number().positive(),
  letterSpacing: z.number().optional(),
  padding: PaddingSchema.optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().min(0).optional(),
  borderRadius: z.number().min(0).optional(),
});
export type TextStyle = z.infer<typeof TextStyleSchema>;

export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  content: TextContentSchema,
  style: TextStyleSchema,
});
export type TextElement = z.infer<typeof TextElementSchema>;

// ============================================================================
// DATA TABLE ELEMENT
// ============================================================================

export const DataBindingSchema = z.object({
  source: z.string(),
  filters: z.record(z.string(), z.any()).optional(),
});
export type DataBinding = z.infer<typeof DataBindingSchema>;

export const ColumnFormatSchema = z.enum(['text', 'number', 'percentage', 'date']);
export type ColumnFormat = z.infer<typeof ColumnFormatSchema>;

export const ColumnWidthSchema = z.union([z.number().positive(), z.literal('auto')]);
export type ColumnWidth = z.infer<typeof ColumnWidthSchema>;

export const TableColumnSchema = z.object({
  id: z.string(),
  header: z.string(),
  field: z.string(),
  width: ColumnWidthSchema.optional(),
  align: TextAlignSchema.optional(),
  format: ColumnFormatSchema.optional(),
});
export type TableColumn = z.infer<typeof TableColumnSchema>;

export const TableStyleSchema = z.object({
  headerBackgroundColor: z.string(),
  headerTextColor: z.string(),
  headerFontSize: z.number().positive(),
  headerFontWeight: FontWeightSchema,
  rowBackgroundColor: z.string(),
  rowAlternateColor: z.string().optional(),
  rowTextColor: z.string(),
  rowFontSize: z.number().positive(),
  borderColor: z.string(),
  borderWidth: z.number().min(0),
  cellPadding: z.number().min(0),
});
export type TableStyle = z.infer<typeof TableStyleSchema>;

export const TableOptionsSchema = z.object({
  showHeader: z.boolean(),
  showBorders: z.boolean(),
  alternateRows: z.boolean(),
  maxRows: z.number().positive().optional(),
});
export type TableOptions = z.infer<typeof TableOptionsSchema>;

export const DataTableElementSchema = BaseElementSchema.extend({
  type: z.literal('data-table'),
  dataBinding: DataBindingSchema,
  columns: z.array(TableColumnSchema),
  style: TableStyleSchema,
  options: TableOptionsSchema,
});
export type DataTableElement = z.infer<typeof DataTableElementSchema>;

// ============================================================================
// IMAGE ELEMENT
// ============================================================================

export const ImageSourceSchema = z.enum(['upload', 'url', 'binding']);
export type ImageSource = z.infer<typeof ImageSourceSchema>;

export const ImageFitSchema = z.enum(['cover', 'contain', 'fill', 'none']);
export type ImageFit = z.infer<typeof ImageFitSchema>;

export const ImageContentSchema = z.object({
  source: ImageSourceSchema,
  value: z.string(),
  alt: z.string().optional(),
  fit: ImageFitSchema,
});
export type ImageContent = z.infer<typeof ImageContentSchema>;

export const ImageStyleSchema = z.object({
  borderColor: z.string().optional(),
  borderWidth: z.number().min(0).optional(),
  borderRadius: z.number().min(0).optional(),
  opacity: z.number().min(0).max(1).optional(),
});
export type ImageStyle = z.infer<typeof ImageStyleSchema>;

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),
  content: ImageContentSchema,
  style: ImageStyleSchema,
});
export type ImageElement = z.infer<typeof ImageElementSchema>;

// ============================================================================
// IMAGE GALLERY ELEMENT
// ============================================================================

export const GalleryLayoutTypeSchema = z.enum(['grid', 'row', 'column']);
export type GalleryLayoutType = z.infer<typeof GalleryLayoutTypeSchema>;

export const GallerySortBySchema = z.enum(['date', 'random']);
export type GallerySortBy = z.infer<typeof GallerySortBySchema>;

export const GalleryDataBindingSchema = z.object({
  source: z.literal('galeri_kegiatan'),
  filters: z
    .object({
      periode: z.string().optional(),
      scope: z.string().optional(),
    })
    .optional(),
  maxImages: z.number().positive(),
  sortBy: GallerySortBySchema.optional(),
});
export type GalleryDataBinding = z.infer<typeof GalleryDataBindingSchema>;

export const GalleryLayoutSchema = z.object({
  type: GalleryLayoutTypeSchema,
  columns: z.number().positive().optional(),
  gap: z.number().min(0),
});
export type GalleryLayout = z.infer<typeof GalleryLayoutSchema>;

export const GalleryImageStyleSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  fit: ImageFitSchema,
  borderRadius: z.number().min(0).optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().min(0).optional(),
});
export type GalleryImageStyle = z.infer<typeof GalleryImageStyleSchema>;

export const CaptionPositionSchema = z.enum(['below', 'overlay']);
export type CaptionPosition = z.infer<typeof CaptionPositionSchema>;

export const CaptionStyleSchema = z.object({
  fontSize: z.number().positive(),
  color: z.string(),
  backgroundColor: z.string().optional(),
});
export type CaptionStyle = z.infer<typeof CaptionStyleSchema>;

export const GalleryOptionsSchema = z.object({
  showCaptions: z.boolean(),
  captionPosition: CaptionPositionSchema,
  captionStyle: CaptionStyleSchema.optional(),
});
export type GalleryOptions = z.infer<typeof GalleryOptionsSchema>;

export const ImageGalleryElementSchema = BaseElementSchema.extend({
  type: z.literal('image-gallery'),
  dataBinding: GalleryDataBindingSchema,
  layout: GalleryLayoutSchema,
  imageStyle: GalleryImageStyleSchema,
  options: GalleryOptionsSchema,
});
export type ImageGalleryElement = z.infer<typeof ImageGalleryElementSchema>;

// ============================================================================
// SIGNATURE ELEMENT
// ============================================================================

export const SignatureContentSchema = z.object({
  label: z.string(),
  name: z.string().optional(),
  showLine: z.boolean(),
  showDate: z.boolean(),
});
export type SignatureContent = z.infer<typeof SignatureContentSchema>;

export const SignatureStyleSchema = z.object({
  fontSize: z.number().positive(),
  fontFamily: z.string(),
  color: z.string(),
  textAlign: TextAlignSchema,
  lineColor: z.string().optional(),
  lineWidth: z.number().min(0).optional(),
});
export type SignatureStyle = z.infer<typeof SignatureStyleSchema>;

export const SignatureElementSchema = BaseElementSchema.extend({
  type: z.literal('signature'),
  content: SignatureContentSchema,
  style: SignatureStyleSchema,
});
export type SignatureElement = z.infer<typeof SignatureElementSchema>;

// ============================================================================
// LINE ELEMENT
// ============================================================================

export const LineStyleTypeSchema = z.enum(['solid', 'dashed', 'dotted']);
export type LineStyleType = z.infer<typeof LineStyleTypeSchema>;

export const LineStyleSchema = z.object({
  color: z.string(),
  width: z.number().positive(),
  style: LineStyleTypeSchema,
});
export type LineStyle = z.infer<typeof LineStyleSchema>;

export const LineElementSchema = BaseElementSchema.extend({
  type: z.literal('line'),
  style: LineStyleSchema,
});
export type LineElement = z.infer<typeof LineElementSchema>;

// ============================================================================
// UNION TYPE FOR ALL ELEMENTS
// ============================================================================

export const TemplateElementSchema = z.discriminatedUnion('type', [
  HeaderElementSchema,
  TextElementSchema,
  DataTableElementSchema,
  ImageElementSchema,
  ImageGalleryElementSchema,
  SignatureElementSchema,
  LineElementSchema,
]);
export type TemplateElement = z.infer<typeof TemplateElementSchema>;

// ============================================================================
// DATA BINDING SCHEMA (for runtime data)
// ============================================================================

export const SiswaDataSchema = z.object({
  id: z.string(),
  nama: z.string(),
  nis: z.string(),
  kelas: z.string(),
  asrama: z.string(),
  cabang: z.string(),
  foto_url: z.string().optional(),
});
export type SiswaData = z.infer<typeof SiswaDataSchema>;

export const PeriodeDataSchema = z.object({
  tahun_ajaran: z.string(),
  semester: z.number().int().min(1).max(2),
  bulan: z.number().int().min(1).max(12).optional(),
});
export type PeriodeData = z.infer<typeof PeriodeDataSchema>;

export const IndikatorDetailSchema = z.object({
  indikator: z.string(),
  nilai: z.number(),
  persentase: z.number(),
});
export type IndikatorDetail = z.infer<typeof IndikatorDetailSchema>;

export const KategoriHabitSchema = z.object({
  average: z.number(),
  percentage: z.number(),
  details: z.array(IndikatorDetailSchema),
});
export type KategoriHabit = z.infer<typeof KategoriHabitSchema>;

export const HabitTrackerDataSchema = z.object({
  periode: PeriodeDataSchema,
  ubudiyah: KategoriHabitSchema,
  akhlaq: KategoriHabitSchema,
  kedisiplinan: KategoriHabitSchema,
  kebersihan: KategoriHabitSchema,
  overall_average: z.number(),
  overall_percentage: z.number(),
});
export type HabitTrackerData = z.infer<typeof HabitTrackerDataSchema>;

export const GalleryItemSchema = z.object({
  id: z.string(),
  nama_kegiatan: z.string(),
  tanggal: z.string(),
  foto_url: z.string(),
  caption: z.string().optional(),
});
export type GalleryItem = z.infer<typeof GalleryItemSchema>;

export const SchoolDataSchema = z.object({
  nama: z.string(),
  logo_url: z.string(),
  alamat: z.string(),
  telepon: z.string(),
  website: z.string(),
});
export type SchoolData = z.infer<typeof SchoolDataSchema>;

export const PembinaDataSchema = z.object({
  nama: z.string(),
  nip: z.string(),
});
export type PembinaData = z.infer<typeof PembinaDataSchema>;

export const KepalaSekolahDataSchema = z.object({
  nama: z.string(),
  nip: z.string(),
});
export type KepalaSekolahData = z.infer<typeof KepalaSekolahDataSchema>;

export const DataBindingSchemaType = z.object({
  siswa: SiswaDataSchema,
  habit_tracker: HabitTrackerDataSchema,
  galeri_kegiatan: z.array(GalleryItemSchema),
  school: SchoolDataSchema,
  pembina: PembinaDataSchema,
  kepala_sekolah: KepalaSekolahDataSchema,
});
export type DataBindingSchemaType = z.infer<typeof DataBindingSchemaType>;

// ============================================================================
// TEMPLATE WITH ELEMENTS (Complete Template)
// ============================================================================

export const CompleteTemplateSchema = z.object({
  template: TemplateConfigSchema,
  elements: z.array(TemplateElementSchema),
});
export type CompleteTemplate = z.infer<typeof CompleteTemplateSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates if an element's position is within canvas bounds
 */
export function validateElementPosition(
  element: BaseElement,
  canvasDimensions: Dimensions
): boolean {
  return (
    element.position.x >= 0 &&
    element.position.y >= 0 &&
    element.position.x + element.size.width <= canvasDimensions.width &&
    element.position.y + element.size.height <= canvasDimensions.height
  );
}

/**
 * Validates if element IDs are unique in a template
 */
export function validateUniqueElementIds(elements: TemplateElement[]): boolean {
  const ids = elements.map((el) => el.id);
  return ids.length === new Set(ids).size;
}

/**
 * Validates if a data binding placeholder is valid
 */
export function validateDataBinding(placeholder: string): boolean {
  // Check if placeholder matches pattern {{source.field}} or {{source.nested.field}}
  const pattern = /^\{\{[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+\}\}$/;
  return pattern.test(placeholder);
}

/**
 * Extracts placeholder variables from text
 */
export function extractPlaceholders(text: string): string[] {
  const pattern = /\{\{([^}]+)\}\}/g;
  const matches = text.matchAll(pattern);
  return Array.from(matches, (m) => m[1]);
}

/**
 * Validates if all placeholders in text reference valid fields
 */
export function validatePlaceholders(
  text: string,
  validFields: string[]
): { valid: boolean; invalidFields: string[] } {
  const placeholders = extractPlaceholders(text);
  const invalidFields = placeholders.filter((p) => !validFields.includes(p));
  return {
    valid: invalidFields.length === 0,
    invalidFields,
  };
}
