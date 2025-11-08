# Element Renderers

This directory contains dedicated renderer components for each element type in the Template Builder.

## Components

### HeaderElementRenderer
Renders header elements with:
- Logo support (upload, URL, or data binding)
- Title and subtitle with custom styling
- Background color and borders
- Flexible padding configuration

### TextElementRenderer
Renders text elements with:
- Rich text support (bold, italic)
- Multi-line text with configurable line-height
- Data binding placeholder detection
- Full styling control (font, size, color, alignment)

### DataTableElementRenderer
Renders data table elements with:
- Configurable columns with headers
- Sample data rows for preview
- Alternate row colors
- Border and cell padding controls
- Data source indicator

### ImageElementRenderer
Renders image elements with:
- Multiple image sources (upload, URL, binding)
- Fit options (cover, contain, fill)
- Border and border-radius styling
- Placeholder for missing images

### ImageGalleryElementRenderer
Renders image gallery elements with:
- Grid, row, or column layouts
- Configurable number of images
- Image placeholders for preview
- Optional captions
- Gap and styling controls

### SignatureElementRenderer
Renders signature elements with:
- Label text
- Signature line (optional)
- Name field (supports data binding)
- Date display (optional)
- Text alignment and styling

### LineElementRenderer
Renders line/divider elements with:
- Horizontal or vertical orientation (auto-detected)
- Color, width, and style (solid, dashed, dotted)
- Minimal and clean rendering

## Usage

These renderers are used by the `DraggableElement` component to display element content on the canvas. Each renderer receives the element data as props and handles the visual representation according to the element's configuration.

```tsx
import { HeaderElementRenderer } from './element-renderers';

<HeaderElementRenderer element={headerElement} />
```

## Features

- **Type-safe**: All renderers use TypeScript interfaces from `@/types/rapor-builder`
- **Modular**: Each element type has its own dedicated renderer
- **Reusable**: Can be used in canvas, preview, and PDF generation
- **Placeholder support**: Shows placeholders for data bindings during design
- **Responsive**: Adapts to element size and configuration
