import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import {
  TemplateConfig,
  TemplateElement,
  DataBindingSchemaType,
  HeaderElement,
  TextElement,
  DataTableElement,
  ImageElement,
  ImageGalleryElement,
  SignatureElement,
  LineElement,
} from '@/types/rapor-builder';
import { replacePlaceholders } from './placeholder-resolver';

/**
 * PDF Preview Renderer
 * Renders template elements to PDF using React-PDF
 */

// Create styles for PDF
const createStyles = () =>
  StyleSheet.create({
    page: {
      backgroundColor: '#ffffff',
      padding: 0,
    },
    element: {
      position: 'absolute',
    },
  });

/**
 * Convert pixels to points (PDF units)
 * 1 pixel = 0.75 points (assuming 96 DPI)
 */
function pxToPoints(px: number): number {
  return px * 0.75;
}

/**
 * Render a single element based on its type
 */
function renderElement(
  element: TemplateElement,
  data: DataBindingSchemaType
): React.ReactElement | null {
  if (!element.isVisible) return null;

  const style = {
    position: 'absolute' as const,
    left: pxToPoints(element.position.x),
    top: pxToPoints(element.position.y),
    width: pxToPoints(element.size.width),
    height: pxToPoints(element.size.height),
  };

  switch (element.type) {
    case 'header':
      return renderHeaderElement(element, data, style);
    case 'text':
      return renderTextElement(element, data, style);
    case 'data-table':
      return renderDataTableElement(element, data, style);
    case 'image':
      return renderImageElement(element, data, style);
    case 'image-gallery':
      return renderImageGalleryElement(element, data, style);
    case 'signature':
      return renderSignatureElement(element, data, style);
    case 'line':
      return renderLineElement(element, style);
    default:
      return null;
  }
}

/**
 * Render Header Element
 */
function renderHeaderElement(
  element: HeaderElement,
  data: DataBindingSchemaType,
  baseStyle: any
): React.ReactElement {
  const { content, style: elemStyle } = element;

  return (
    <View
      key={element.id}
      style={{
        ...baseStyle,
        backgroundColor: elemStyle.backgroundColor,
        borderColor: elemStyle.borderColor,
        borderWidth: elemStyle.borderWidth,
        borderRadius: elemStyle.borderRadius,
        padding: pxToPoints(elemStyle.padding.top),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: content.title.align === 'center' ? 'center' : content.title.align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {content.logo && (
        <Image
          src={replacePlaceholders(content.logo.value, data)}
          style={{
            width: pxToPoints(content.logo.size.width),
            height: pxToPoints(content.logo.size.height),
            marginBottom: 8,
          }}
        />
      )}
      <Text
        style={{
          fontSize: content.title.fontSize,
          fontWeight: content.title.fontWeight === 'bold' ? 'bold' : 'normal',
          fontFamily: content.title.fontFamily,
          color: content.title.color,
          textAlign: content.title.align,
        }}
      >
        {replacePlaceholders(content.title.text, data)}
      </Text>
      {content.subtitle && (
        <Text
          style={{
            fontSize: content.subtitle.fontSize,
            color: content.subtitle.color,
            marginTop: 4,
          }}
        >
          {replacePlaceholders(content.subtitle.text, data)}
        </Text>
      )}
    </View>
  );
}

/**
 * Render Text Element
 */
function renderTextElement(
  element: TextElement,
  data: DataBindingSchemaType,
  baseStyle: any
): React.ReactElement {
  const { content, style: elemStyle } = element;

  return (
    <View
      key={element.id}
      style={{
        ...baseStyle,
        backgroundColor: elemStyle.backgroundColor,
        borderColor: elemStyle.borderColor,
        borderWidth: elemStyle.borderWidth,
        borderRadius: elemStyle.borderRadius,
        padding: elemStyle.padding ? pxToPoints(elemStyle.padding.top) : 0,
      }}
    >
      <Text
        style={{
          fontSize: elemStyle.fontSize,
          fontWeight: elemStyle.fontWeight === 'bold' ? 'bold' : 'normal',
          fontFamily: elemStyle.fontFamily,
          color: elemStyle.color,
          textAlign: elemStyle.textAlign,
          lineHeight: elemStyle.lineHeight,
          letterSpacing: elemStyle.letterSpacing,
        }}
      >
        {replacePlaceholders(content.text, data)}
      </Text>
    </View>
  );
}

/**
 * Render Data Table Element
 */
function renderDataTableElement(
  element: DataTableElement,
  data: DataBindingSchemaType,
  baseStyle: any
): React.ReactElement {
  const { columns, style: elemStyle, options, dataBinding } = element;

  // Get table data from data binding
  let tableData: any[] = [];
  if (dataBinding.source.startsWith('habit_tracker.')) {
    const category = dataBinding.source.split('.')[1];
    if (data.habit_tracker && data.habit_tracker[category as keyof typeof data.habit_tracker]) {
      const categoryData = data.habit_tracker[category as keyof typeof data.habit_tracker];
      if (typeof categoryData === 'object' && 'details' in categoryData) {
        tableData = (categoryData as any).details || [];
      }
    }
  }

  // Apply max rows limit
  if (options.maxRows && tableData.length > options.maxRows) {
    tableData = tableData.slice(0, options.maxRows);
  }

  return (
    <View key={element.id} style={baseStyle}>
      {/* Table Header */}
      {options.showHeader && (
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: elemStyle.headerBackgroundColor,
            borderBottomWidth: options.showBorders ? elemStyle.borderWidth : 0,
            borderColor: elemStyle.borderColor,
          }}
        >
          {columns.map((col) => (
            <View
              key={col.id}
              style={{
                flex: col.width === 'auto' ? 1 : 0,
                width: col.width !== 'auto' ? pxToPoints(col.width as number) : undefined,
                padding: pxToPoints(elemStyle.cellPadding),
                borderRightWidth: options.showBorders ? elemStyle.borderWidth : 0,
                borderColor: elemStyle.borderColor,
              }}
            >
              <Text
                style={{
                  fontSize: elemStyle.headerFontSize,
                  fontWeight: elemStyle.headerFontWeight === 'bold' ? 'bold' : 'normal',
                  color: elemStyle.headerTextColor,
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Table Rows */}
      {tableData.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            backgroundColor:
              options.alternateRows && rowIndex % 2 === 1
                ? elemStyle.rowAlternateColor
                : elemStyle.rowBackgroundColor,
            borderBottomWidth: options.showBorders ? elemStyle.borderWidth : 0,
            borderColor: elemStyle.borderColor,
          }}
        >
          {columns.map((col) => {
            let cellValue = row[col.field] || '';
            
            // Format based on column format
            if (col.format === 'number' && typeof cellValue === 'number') {
              cellValue = cellValue.toFixed(1);
            } else if (col.format === 'percentage' && typeof cellValue === 'number') {
              cellValue = `${cellValue.toFixed(1)}%`;
            }

            return (
              <View
                key={col.id}
                style={{
                  flex: col.width === 'auto' ? 1 : 0,
                  width: col.width !== 'auto' ? pxToPoints(col.width as number) : undefined,
                  padding: pxToPoints(elemStyle.cellPadding),
                  borderRightWidth: options.showBorders ? elemStyle.borderWidth : 0,
                  borderColor: elemStyle.borderColor,
                }}
              >
                <Text
                  style={{
                    fontSize: elemStyle.rowFontSize,
                    color: elemStyle.rowTextColor,
                    textAlign: col.align || 'left',
                  }}
                >
                  {cellValue}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/**
 * Render Image Element
 */
function renderImageElement(
  element: ImageElement,
  data: DataBindingSchemaType,
  baseStyle: any
): React.ReactElement {
  const { content, style: elemStyle } = element;

  let imageUrl = content.value;
  if (content.source === 'binding') {
    imageUrl = replacePlaceholders(content.value, data);
  }

  return (
    <View
      key={element.id}
      style={{
        ...baseStyle,
        borderColor: elemStyle.borderColor,
        borderWidth: elemStyle.borderWidth,
        borderRadius: elemStyle.borderRadius,
        overflow: 'hidden',
      }}
    >
      <Image
        src={imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: content.fit,
          opacity: elemStyle.opacity || 1,
        }}
      />
    </View>
  );
}

/**
 * Render Image Gallery Element
 */
function renderImageGalleryElement(
  element: ImageGalleryElement,
  data: DataBindingSchemaType,
  baseStyle: any
): React.ReactElement {
  const { dataBinding, layout, imageStyle, options } = element;

  // Get gallery images
  let images = data.galeri_kegiatan || [];
  
  // Apply max images limit
  if (images.length > dataBinding.maxImages) {
    images = images.slice(0, dataBinding.maxImages);
  }

  // Calculate layout
  const isGrid = layout.type === 'grid';
  const columns = layout.columns || 3;
  const gap = pxToPoints(layout.gap);

  return (
    <View key={element.id} style={baseStyle}>
      <View
        style={{
          flexDirection: isGrid ? 'row' : layout.type === 'row' ? 'row' : 'column',
          flexWrap: isGrid ? 'wrap' : 'nowrap',
          gap: gap,
        }}
      >
        {images.map((image, index) => (
          <View
            key={image.id}
            style={{
              width: pxToPoints(imageStyle.width),
              marginRight: isGrid && (index + 1) % columns !== 0 ? gap : 0,
              marginBottom: gap,
            }}
          >
            <Image
              src={image.foto_url}
              style={{
                width: pxToPoints(imageStyle.width),
                height: pxToPoints(imageStyle.height),
                objectFit: imageStyle.fit,
                borderRadius: imageStyle.borderRadius,
                borderColor: imageStyle.borderColor,
                borderWidth: imageStyle.borderWidth,
              }}
            />
            {options.showCaptions && image.caption && (
              <Text
                style={{
                  fontSize: options.captionStyle?.fontSize || 10,
                  color: options.captionStyle?.color || '#000000',
                  backgroundColor: options.captionStyle?.backgroundColor,
                  marginTop: 4,
                  padding: 4,
                }}
              >
                {image.caption}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Render Signature Element
 */
function renderSignatureElement(
  element: SignatureElement,
  data: DataBindingSchemaType,
  baseStyle: any
): React.ReactElement {
  const { content, style: elemStyle } = element;

  return (
    <View
      key={element.id}
      style={{
        ...baseStyle,
        alignItems: elemStyle.textAlign === 'center' ? 'center' : elemStyle.textAlign === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      <Text
        style={{
          fontSize: elemStyle.fontSize,
          fontFamily: elemStyle.fontFamily,
          color: elemStyle.color,
          marginBottom: 8,
        }}
      >
        {content.label}
      </Text>
      {content.showLine && (
        <View
          style={{
            width: '100%',
            height: elemStyle.lineWidth || 1,
            backgroundColor: elemStyle.lineColor || '#000000',
            marginVertical: 20,
          }}
        />
      )}
      {content.name && (
        <Text
          style={{
            fontSize: elemStyle.fontSize,
            fontFamily: elemStyle.fontFamily,
            color: elemStyle.color,
            marginTop: 8,
          }}
        >
          {replacePlaceholders(content.name, data)}
        </Text>
      )}
      {content.showDate && (
        <Text
          style={{
            fontSize: elemStyle.fontSize - 2,
            color: elemStyle.color,
            marginTop: 4,
          }}
        >
          {new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      )}
    </View>
  );
}

/**
 * Render Line Element
 */
function renderLineElement(
  element: LineElement,
  baseStyle: any
): React.ReactElement {
  const { style: elemStyle } = element;

  return (
    <View
      key={element.id}
      style={{
        ...baseStyle,
        backgroundColor: elemStyle.color,
        height: pxToPoints(elemStyle.width),
        borderStyle: elemStyle.style,
      }}
    />
  );
}

/**
 * Main PDF Document Component
 */
interface PDFDocumentProps {
  templateConfig: TemplateConfig;
  elements: TemplateElement[];
  data: DataBindingSchemaType;
}

function PDFDocumentComponent({
  templateConfig,
  elements,
  data,
}: PDFDocumentProps) {
  const styles = createStyles();

  // Sort elements by z-index
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <Document>
      <Page
        size="A4"
        orientation={templateConfig.orientation}
        style={{
          ...styles.page,
          backgroundColor: templateConfig.backgroundColor,
          paddingTop: pxToPoints(templateConfig.margins.top),
          paddingRight: pxToPoints(templateConfig.margins.right),
          paddingBottom: pxToPoints(templateConfig.margins.bottom),
          paddingLeft: pxToPoints(templateConfig.margins.left),
        }}
      >
        {sortedElements.map((element) => renderElement(element, data))}
      </Page>
    </Document>
  );
}

/**
 * HTML Preview Component (for browser rendering)
 */
interface PreviewProps {
  templateConfig: TemplateConfig;
  elements: TemplateElement[];
  data: DataBindingSchemaType;
}

export default function PDFPreviewRenderer({
  templateConfig,
  elements,
  data,
}: PreviewProps) {
  // Sort elements by z-index
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: templateConfig.backgroundColor,
        padding: `${templateConfig.margins.top}px ${templateConfig.margins.right}px ${templateConfig.margins.bottom}px ${templateConfig.margins.left}px`,
        position: 'relative',
        margin: '0 auto',
      }}
    >
      {sortedElements.map((element) => {
        if (!element.isVisible) return null;
        return renderHTMLElement(element, data);
      })}
    </div>
  );
}

/**
 * Render element as HTML for browser preview
 */
function renderHTMLElement(
  element: TemplateElement,
  data: DataBindingSchemaType
): React.ReactElement | null {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    width: `${element.size.width}px`,
    height: `${element.size.height}px`,
  };

  switch (element.type) {
    case 'header':
      return renderHTMLHeader(element, data, baseStyle);
    case 'text':
      return renderHTMLText(element, data, baseStyle);
    case 'data-table':
      return renderHTMLDataTable(element, data, baseStyle);
    case 'image':
      return renderHTMLImage(element, data, baseStyle);
    case 'image-gallery':
      return renderHTMLImageGallery(element, data, baseStyle);
    case 'signature':
      return renderHTMLSignature(element, data, baseStyle);
    case 'line':
      return renderHTMLLine(element, baseStyle);
    default:
      return null;
  }
}

function renderHTMLHeader(
  element: HeaderElement,
  data: DataBindingSchemaType,
  baseStyle: React.CSSProperties
): React.ReactElement {
  const { content, style: elemStyle } = element;

  return (
    <div
      key={element.id}
      style={{
        ...baseStyle,
        backgroundColor: elemStyle.backgroundColor,
        border: elemStyle.borderWidth ? `${elemStyle.borderWidth}px solid ${elemStyle.borderColor}` : 'none',
        borderRadius: elemStyle.borderRadius ? `${elemStyle.borderRadius}px` : '0',
        padding: `${elemStyle.padding.top}px ${elemStyle.padding.right}px ${elemStyle.padding.bottom}px ${elemStyle.padding.left}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: content.title.align,
      }}
    >
      {content.logo && (
        <img
          src={replacePlaceholders(content.logo.value, data)}
          alt="Logo"
          style={{
            width: `${content.logo.size.width}px`,
            height: `${content.logo.size.height}px`,
            marginBottom: '8px',
          }}
        />
      )}
      <div
        style={{
          fontSize: `${content.title.fontSize}px`,
          fontWeight: content.title.fontWeight,
          fontFamily: content.title.fontFamily,
          color: content.title.color,
          textAlign: content.title.align,
        }}
      >
        {replacePlaceholders(content.title.text, data)}
      </div>
      {content.subtitle && (
        <div
          style={{
            fontSize: `${content.subtitle.fontSize}px`,
            color: content.subtitle.color,
            marginTop: '4px',
          }}
        >
          {replacePlaceholders(content.subtitle.text, data)}
        </div>
      )}
    </div>
  );
}

function renderHTMLText(
  element: TextElement,
  data: DataBindingSchemaType,
  baseStyle: React.CSSProperties
): React.ReactElement {
  const { content, style: elemStyle } = element;

  return (
    <div
      key={element.id}
      style={{
        ...baseStyle,
        backgroundColor: elemStyle.backgroundColor,
        border: elemStyle.borderWidth ? `${elemStyle.borderWidth}px solid ${elemStyle.borderColor}` : 'none',
        borderRadius: elemStyle.borderRadius ? `${elemStyle.borderRadius}px` : '0',
        padding: elemStyle.padding ? `${elemStyle.padding.top}px ${elemStyle.padding.right}px ${elemStyle.padding.bottom}px ${elemStyle.padding.left}px` : '0',
        fontSize: `${elemStyle.fontSize}px`,
        fontWeight: elemStyle.fontWeight,
        fontFamily: elemStyle.fontFamily,
        color: elemStyle.color,
        textAlign: elemStyle.textAlign,
        lineHeight: elemStyle.lineHeight,
        letterSpacing: elemStyle.letterSpacing ? `${elemStyle.letterSpacing}px` : 'normal',
        overflow: 'auto',
      }}
    >
      {replacePlaceholders(content.text, data)}
    </div>
  );
}

function renderHTMLDataTable(
  element: DataTableElement,
  data: DataBindingSchemaType,
  baseStyle: React.CSSProperties
): React.ReactElement {
  const { columns, style: elemStyle, options, dataBinding } = element;

  // Get table data
  let tableData: any[] = [];
  if (dataBinding.source.startsWith('habit_tracker.')) {
    const category = dataBinding.source.split('.')[1];
    if (data.habit_tracker && data.habit_tracker[category as keyof typeof data.habit_tracker]) {
      const categoryData = data.habit_tracker[category as keyof typeof data.habit_tracker];
      if (typeof categoryData === 'object' && 'details' in categoryData) {
        tableData = (categoryData as any).details || [];
      }
    }
  }

  if (options.maxRows && tableData.length > options.maxRows) {
    tableData = tableData.slice(0, options.maxRows);
  }

  return (
    <div key={element.id} style={baseStyle}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {options.showHeader && (
          <thead>
            <tr style={{ backgroundColor: elemStyle.headerBackgroundColor }}>
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{
                    padding: `${elemStyle.cellPadding}px`,
                    fontSize: `${elemStyle.headerFontSize}px`,
                    fontWeight: elemStyle.headerFontWeight,
                    color: elemStyle.headerTextColor,
                    textAlign: col.align || 'left',
                    border: options.showBorders ? `${elemStyle.borderWidth}px solid ${elemStyle.borderColor}` : 'none',
                    width: col.width !== 'auto' ? `${col.width}px` : 'auto',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                backgroundColor:
                  options.alternateRows && rowIndex % 2 === 1
                    ? elemStyle.rowAlternateColor
                    : elemStyle.rowBackgroundColor,
              }}
            >
              {columns.map((col) => {
                let cellValue = row[col.field] || '';
                if (col.format === 'number' && typeof cellValue === 'number') {
                  cellValue = cellValue.toFixed(1);
                } else if (col.format === 'percentage' && typeof cellValue === 'number') {
                  cellValue = `${cellValue.toFixed(1)}%`;
                }

                return (
                  <td
                    key={col.id}
                    style={{
                      padding: `${elemStyle.cellPadding}px`,
                      fontSize: `${elemStyle.rowFontSize}px`,
                      color: elemStyle.rowTextColor,
                      textAlign: col.align || 'left',
                      border: options.showBorders ? `${elemStyle.borderWidth}px solid ${elemStyle.borderColor}` : 'none',
                    }}
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderHTMLImage(
  element: ImageElement,
  data: DataBindingSchemaType,
  baseStyle: React.CSSProperties
): React.ReactElement {
  const { content, style: elemStyle } = element;

  let imageUrl = content.value;
  if (content.source === 'binding') {
    imageUrl = replacePlaceholders(content.value, data);
  }

  return (
    <div
      key={element.id}
      style={{
        ...baseStyle,
        border: elemStyle.borderWidth ? `${elemStyle.borderWidth}px solid ${elemStyle.borderColor}` : 'none',
        borderRadius: elemStyle.borderRadius ? `${elemStyle.borderRadius}px` : '0',
        overflow: 'hidden',
      }}
    >
      <img
        src={imageUrl}
        alt={content.alt || ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: content.fit,
          opacity: elemStyle.opacity || 1,
        }}
      />
    </div>
  );
}

function renderHTMLImageGallery(
  element: ImageGalleryElement,
  data: DataBindingSchemaType,
  baseStyle: React.CSSProperties
): React.ReactElement {
  const { dataBinding, layout, imageStyle, options } = element;

  let images = data.galeri_kegiatan || [];
  if (images.length > dataBinding.maxImages) {
    images = images.slice(0, dataBinding.maxImages);
  }

  const isGrid = layout.type === 'grid';
  const columns = layout.columns || 3;

  return (
    <div
      key={element.id}
      style={{
        ...baseStyle,
        display: 'flex',
        flexDirection: isGrid ? 'row' : layout.type === 'row' ? 'row' : 'column',
        flexWrap: isGrid ? 'wrap' : 'nowrap',
        gap: `${layout.gap}px`,
      }}
    >
      {images.map((image) => (
        <div
          key={image.id}
          style={{
            width: `${imageStyle.width}px`,
          }}
        >
          <img
            src={image.foto_url}
            alt={image.caption || ''}
            style={{
              width: `${imageStyle.width}px`,
              height: `${imageStyle.height}px`,
              objectFit: imageStyle.fit,
              borderRadius: imageStyle.borderRadius ? `${imageStyle.borderRadius}px` : '0',
              border: imageStyle.borderWidth ? `${imageStyle.borderWidth}px solid ${imageStyle.borderColor}` : 'none',
            }}
          />
          {options.showCaptions && image.caption && (
            <div
              style={{
                fontSize: `${options.captionStyle?.fontSize || 10}px`,
                color: options.captionStyle?.color || '#000000',
                backgroundColor: options.captionStyle?.backgroundColor,
                marginTop: '4px',
                padding: '4px',
              }}
            >
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function renderHTMLSignature(
  element: SignatureElement,
  data: DataBindingSchemaType,
  baseStyle: React.CSSProperties
): React.ReactElement {
  const { content, style: elemStyle } = element;

  return (
    <div
      key={element.id}
      style={{
        ...baseStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: elemStyle.textAlign === 'center' ? 'center' : elemStyle.textAlign === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          fontSize: `${elemStyle.fontSize}px`,
          fontFamily: elemStyle.fontFamily,
          color: elemStyle.color,
          marginBottom: '8px',
        }}
      >
        {content.label}
      </div>
      {content.showLine && (
        <div
          style={{
            width: '100%',
            height: `${elemStyle.lineWidth || 1}px`,
            backgroundColor: elemStyle.lineColor || '#000000',
            margin: '20px 0',
          }}
        />
      )}
      {content.name && (
        <div
          style={{
            fontSize: `${elemStyle.fontSize}px`,
            fontFamily: elemStyle.fontFamily,
            color: elemStyle.color,
            marginTop: '8px',
          }}
        >
          {replacePlaceholders(content.name, data)}
        </div>
      )}
      {content.showDate && (
        <div
          style={{
            fontSize: `${elemStyle.fontSize - 2}px`,
            color: elemStyle.color,
            marginTop: '4px',
          }}
        >
          {new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      )}
    </div>
  );
}

function renderHTMLLine(
  element: LineElement,
  baseStyle: React.CSSProperties
): React.ReactElement {
  const { style: elemStyle } = element;

  return (
    <div
      key={element.id}
      style={{
        ...baseStyle,
        backgroundColor: elemStyle.color,
        height: `${elemStyle.width}px`,
        borderStyle: elemStyle.style,
      }}
    />
  );
}

/**
 * Generate PDF Blob for download
 */
PDFPreviewRenderer.generatePDFBlob = async (
  templateConfig: TemplateConfig,
  elements: TemplateElement[],
  data: DataBindingSchemaType
): Promise<Blob> => {
  const doc = (
    <PDFDocumentComponent
      templateConfig={templateConfig}
      elements={elements}
      data={data}
    />
  );
  
  return await pdf(doc).toBlob();
};
