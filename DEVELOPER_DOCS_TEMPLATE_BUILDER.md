# Developer Documentation - Template Builder Rapor

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Documentation](#api-documentation)
4. [Frontend Components](#frontend-components)
5. [State Management](#state-management)
6. [PDF Generation](#pdf-generation)
7. [Data Binding System](#data-binding-system)
8. [Adding New Element Types](#adding-new-element-types)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ Template Builder │    │  Rapor Generator │              │
│  │                  │    │                  │              │
│  │ - Canvas Editor  │    │ - Filter UI      │              │
│  │ - DnD System     │    │ - Progress Track │              │
│  │ - Properties     │    │ - Batch Process  │              │
│  │ - Preview        │    │ - Download       │              │
│  └────────┬─────────┘    └────────┬─────────┘              │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       │                                     │
├───────────────────────┼─────────────────────────────────────┤
│                  API Routes (Next.js)                       │
│                       │                                     │
│  /api/rapor/template/builder/...  (Template CRUD)          │
│  /api/rapor/generate/builder/...  (PDF Generation)         │
│  /api/rapor/data/...              (Data Binding)           │
│                       │                                     │
├───────────────────────┼─────────────────────────────────────┤
│                  Business Logic                             │
│                       │                                     │
│  - Template Manager                                         │
│  - PDF Generator (React-PDF)                                │
│  - Data Fetcher                                             │
│  - Placeholder Resolver                                     │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database          Supabase Storage              │
│  - rapor_templates            - Generated PDFs              │
│  - rapor_template_elements    - Template Assets             │
│  - rapor_template_versions    - Logos/Images                │
│  - rapor_generated                                          │
│  - siswa, habit_tracker, etc.                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- @dnd-kit/core & @dnd-kit/sortable
- @react-pdf/renderer
- Zustand (state management)
- react-colorful

**Backend:**
- Supabase (PostgreSQL + Storage)
- Next.js API Routes


### Directory Structure

```
portal-keasramaan/
├── app/
│   ├── api/
│   │   └── rapor/
│   │       ├── template/
│   │       │   └── builder/
│   │       │       ├── route.ts                    # List & Create templates
│   │       │       ├── [id]/
│   │       │       │   ├── route.ts                # Get, Update, Delete template
│   │       │       │   ├── elements/
│   │       │       │   │   ├── route.ts            # Add element
│   │       │       │   │   ├── [elementId]/route.ts # Update, Delete element
│   │       │       │   │   └── reorder/route.ts    # Reorder elements
│   │       │       │   ├── save-version/route.ts   # Save version
│   │       │       │   ├── versions/route.ts       # List versions
│   │       │       │   ├── restore-version/route.ts # Restore version
│   │       │       │   ├── duplicate/route.ts      # Duplicate template
│   │       │       │   └── export/route.ts         # Export template
│   │       │       └── import/route.ts             # Import template
│   │       ├── generate/
│   │       │   └── builder/
│   │       │       ├── single/route.ts             # Generate single PDF
│   │       │       └── bulk/
│   │       │           ├── route.ts                # Start bulk generation
│   │       │           └── [jobId]/
│   │       │               └── status/route.ts     # Get bulk status
│   │       └── data/
│   │           ├── schema/route.ts                 # Get data schema
│   │           └── preview/route.ts                # Get preview data
│   └── manajemen-rapor/
│       ├── template-rapor/
│       │   ├── page.tsx                            # Template list
│       │   └── builder/
│       │       └── [id]/
│       │           └── page.tsx                    # Template Builder UI
│       ├── generate-rapor/
│       │   └── page.tsx                            # Generate Rapor UI
│       └── arsip-rapor/
│           └── page.tsx                            # Rapor Archive UI
├── components/
│   └── rapor/
│       ├── builder/
│       │   ├── TemplateBuilder.tsx                 # Main builder component
│       │   ├── Canvas.tsx                          # Canvas component
│       │   ├── ComponentsSidebar.tsx               # Components sidebar
│       │   ├── PropertiesPanel.tsx                 # Properties panel
│       │   ├── DraggableElement.tsx                # Draggable wrapper
│       │   ├── elements/                           # Element renderers
│       │   │   ├── HeaderElementRenderer.tsx
│       │   │   ├── TextElementRenderer.tsx
│       │   │   ├── DataTableElementRenderer.tsx
│       │   │   ├── ImageElementRenderer.tsx
│       │   │   ├── ImageGalleryElementRenderer.tsx
│       │   │   ├── SignatureElementRenderer.tsx
│       │   │   └── LineElementRenderer.tsx
│       │   └── properties/                         # Property editors
│       │       ├── HeaderPropertyEditor.tsx
│       │       ├── TextPropertyEditor.tsx
│       │       ├── DataTablePropertyEditor.tsx
│       │       ├── ImagePropertyEditor.tsx
│       │       ├── ImageGalleryPropertyEditor.tsx
│       │       ├── SignaturePropertyEditor.tsx
│       │       └── LinePropertyEditor.tsx
│       ├── generator/
│       │   ├── StudentFilter.tsx                   # Student filter component
│       │   ├── PeriodeSelector.tsx                 # Periode selector
│       │   └── GenerationProgress.tsx              # Progress tracker
│       └── archive/
│           ├── ArchiveList.tsx                     # Archive list
│           └── ArchiveFilters.tsx                  # Archive filters
├── lib/
│   └── rapor/
│       ├── builder-pdf-generator.ts                # PDF generator core
│       ├── placeholder-resolver.ts                 # Placeholder resolver
│       ├── data-fetcher.ts                         # Data fetcher
│       ├── pdf-elements/                           # PDF element renderers
│       │   ├── HeaderPDFElement.tsx
│       │   ├── TextPDFElement.tsx
│       │   ├── DataTablePDFElement.tsx
│       │   ├── ImagePDFElement.tsx
│       │   ├── ImageGalleryPDFElement.tsx
│       │   ├── SignaturePDFElement.tsx
│       │   └── LinePDFElement.tsx
│       └── pdf-preview-renderer.tsx                # Preview renderer
├── store/
│   └── templateBuilderStore.ts                     # Zustand store
├── types/
│   └── rapor-builder.ts                            # TypeScript types
└── supabase/
    └── SETUP_TEMPLATE_BUILDER.sql                  # Database schema
```

---

## Database Schema

### Tables

#### 1. rapor_templates (Modified)

Existing table with added columns for builder support.

```sql
ALTER TABLE rapor_templates 
  ADD COLUMN IF NOT EXISTS template_type VARCHAR(20) DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS canvas_config JSONB;

-- Update existing templates
UPDATE rapor_templates SET template_type = 'legacy' WHERE template_type IS NULL;
```

**Columns:**
- `id` (UUID, PK): Template ID
- `nama_template` (VARCHAR): Template name
- `jenis_rapor` (VARCHAR): Report type (semester/bulanan/tahunan)
- `template_type` (VARCHAR): 'legacy' or 'builder'
- `canvas_config` (JSONB): Canvas configuration (for builder type)
- `is_active` (BOOLEAN): Is template active
- `created_by` (UUID, FK): Creator user ID
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**canvas_config structure:**
```json
{
  "pageSize": "A4",
  "orientation": "portrait",
  "dimensions": { "width": 794, "height": 1123 },
  "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
  "backgroundColor": "#ffffff"
}
```


#### 2. rapor_template_elements (New)

Stores individual elements for builder templates.

```sql
CREATE TABLE rapor_template_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES rapor_templates(id) ON DELETE CASCADE,
  element_type VARCHAR(50) NOT NULL,
  position JSONB NOT NULL,
  size JSONB NOT NULL,
  content JSONB,
  style JSONB,
  data_binding JSONB,
  z_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_template_elements_template ON rapor_template_elements(template_id);
CREATE INDEX idx_template_elements_z_index ON rapor_template_elements(template_id, z_index);
```

**Columns:**
- `id` (UUID, PK): Element ID
- `template_id` (UUID, FK): Parent template ID
- `element_type` (VARCHAR): Type of element (header, text, table, etc.)
- `position` (JSONB): `{ x: number, y: number }`
- `size` (JSONB): `{ width: number, height: number }`
- `content` (JSONB): Element-specific content
- `style` (JSONB): Styling properties
- `data_binding` (JSONB): Data source bindings
- `z_index` (INTEGER): Layer order
- `is_visible` (BOOLEAN): Visibility flag

#### 3. rapor_template_versions (New)

Stores version history for templates.

```sql
CREATE TABLE rapor_template_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES rapor_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  canvas_config JSONB NOT NULL,
  elements JSONB NOT NULL,
  created_by UUID REFERENCES guru(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_template_versions_template 
  ON rapor_template_versions(template_id, version_number DESC);
```

**Columns:**
- `id` (UUID, PK): Version ID
- `template_id` (UUID, FK): Parent template ID
- `version_number` (INTEGER): Version number (incremental)
- `canvas_config` (JSONB): Snapshot of canvas config
- `elements` (JSONB): Snapshot of all elements
- `created_by` (UUID, FK): User who saved this version
- `notes` (TEXT): Optional version notes

#### 4. rapor_template_assets (New)

Stores uploaded assets (logos, images, etc.).

```sql
CREATE TABLE rapor_template_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES rapor_templates(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES guru(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_template_assets_template ON rapor_template_assets(template_id);
```

**Columns:**
- `id` (UUID, PK): Asset ID
- `template_id` (UUID, FK): Parent template ID
- `asset_type` (VARCHAR): Type (logo, background, image)
- `file_name` (VARCHAR): Original filename
- `file_url` (TEXT): Supabase Storage URL
- `file_size` (INTEGER): File size in bytes
- `mime_type` (VARCHAR): MIME type
- `uploaded_by` (UUID, FK): Uploader user ID

#### 5. rapor_generated (Modified)

Add template_type column to track which generator was used.

```sql
ALTER TABLE rapor_generated 
  ADD COLUMN IF NOT EXISTS template_type VARCHAR(20);
```

### RLS Policies

```sql
-- Templates: Users can only access templates from their cabang
CREATE POLICY "Users can view templates from their cabang"
  ON rapor_templates FOR SELECT
  USING (
    cabang = (SELECT cabang FROM guru WHERE id = auth.uid())
  );

-- Elements: Inherit from template policy
CREATE POLICY "Users can view elements from their templates"
  ON rapor_template_elements FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM rapor_templates 
      WHERE cabang = (SELECT cabang FROM guru WHERE id = auth.uid())
    )
  );

-- Similar policies for INSERT, UPDATE, DELETE
```

---

## API Documentation

### Template CRUD APIs

#### GET /api/rapor/template/builder

List all builder templates.

**Query Parameters:**
- `jenis_rapor` (optional): Filter by report type
- `is_active` (optional): Filter by active status

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    nama_template: string;
    jenis_rapor: string;
    template_type: 'builder';
    canvas_config: TemplateConfig;
    element_count: number;
    created_at: string;
    updated_at: string;
  }>;
}
```

#### POST /api/rapor/template/builder

Create new builder template.

**Request Body:**
```typescript
{
  nama_template: string;
  jenis_rapor: 'semester' | 'bulanan' | 'tahunan';
  canvas_config?: Partial<TemplateConfig>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    nama_template: string;
    // ... other fields
  };
}
```

#### GET /api/rapor/template/builder/[id]

Get template with all elements.

**Response:**
```typescript
{
  success: boolean;
  data: {
    template: {
      id: string;
      nama_template: string;
      canvas_config: TemplateConfig;
      // ... other fields
    };
    elements: TemplateElement[];
  };
}
```

#### PUT /api/rapor/template/builder/[id]

Update template configuration.

**Request Body:**
```typescript
{
  nama_template?: string;
  canvas_config?: Partial<TemplateConfig>;
  is_active?: boolean;
}
```

#### DELETE /api/rapor/template/builder/[id]

Delete template and all its elements.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```


### Element CRUD APIs

#### POST /api/rapor/template/builder/[id]/elements

Add element to template.

**Request Body:**
```typescript
{
  element: TemplateElement;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    element_type: string;
    // ... other fields
  };
}
```

#### PUT /api/rapor/template/builder/[id]/elements/[elementId]

Update element properties.

**Request Body:**
```typescript
{
  element: Partial<TemplateElement>;
}
```

#### DELETE /api/rapor/template/builder/[id]/elements/[elementId]

Delete element.

#### POST /api/rapor/template/builder/[id]/elements/reorder

Reorder elements (update z-index).

**Request Body:**
```typescript
{
  elementIds: string[]; // Ordered array from back to front
}
```

### Version APIs

#### POST /api/rapor/template/builder/[id]/save-version

Save current state as new version.

**Request Body:**
```typescript
{
  notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    version_number: number;
    id: string;
  };
}
```

#### GET /api/rapor/template/builder/[id]/versions

Get version history.

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    version_number: number;
    created_at: string;
    created_by: string;
    notes?: string;
  }>;
}
```

#### POST /api/rapor/template/builder/[id]/restore-version

Restore specific version.

**Request Body:**
```typescript
{
  versionId: string;
}
```

### Data Binding APIs

#### GET /api/rapor/data/schema

Get available data binding schema.

**Response:**
```typescript
{
  success: boolean;
  schema: {
    siswa: {
      fields: Array<{
        name: string;
        type: string;
        description: string;
        example: any;
      }>;
    };
    habit_tracker: { /* ... */ };
    galeri_kegiatan: { /* ... */ };
    school: { /* ... */ };
    pembina: { /* ... */ };
  };
}
```

#### POST /api/rapor/data/preview

Get preview data for template.

**Request Body:**
```typescript
{
  siswaId?: string;
  periode: {
    tahun_ajaran: string;
    semester: number;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  data: DataBindingSchema; // Filled with actual or sample data
}
```

### PDF Generation APIs

#### POST /api/rapor/generate/builder/single

Generate single PDF.

**Request Body:**
```typescript
{
  templateId: string;
  siswaId: string;
  periode: {
    tahun_ajaran: string;
    semester: number;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    pdfUrl: string;
    generatedId: string;
  };
}
```

#### POST /api/rapor/generate/builder/bulk

Start bulk PDF generation.

**Request Body:**
```typescript
{
  templateId: string;
  siswaIds: string[];
  periode: {
    tahun_ajaran: string;
    semester: number;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    jobId: string;
    totalStudents: number;
  };
}
```

#### GET /api/rapor/generate/builder/bulk/[jobId]/status

Get bulk generation status.

**Response:**
```typescript
{
  success: boolean;
  data: {
    status: 'processing' | 'completed' | 'failed';
    progress: {
      total: number;
      completed: number;
      failed: number;
      current?: string;
    };
    results: Array<{
      siswaId: string;
      siswaName: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      pdfUrl?: string;
      error?: string;
    }>;
  };
}
```

---

## Frontend Components

### Template Builder Components

#### TemplateBuilder.tsx

Main container component for the template builder.

**Props:**
```typescript
interface TemplateBuilderProps {
  templateId: string;
}
```

**Features:**
- Three-column layout (Sidebar | Canvas | Properties)
- Top toolbar with actions
- Keyboard shortcuts handler
- Auto-save functionality

**Usage:**
```tsx
<TemplateBuilder templateId={params.id} />
```

#### Canvas.tsx

Canvas component for rendering and editing elements.

**Props:**
```typescript
interface CanvasProps {
  templateConfig: TemplateConfig;
  elements: TemplateElement[];
  selectedElementId?: string;
  zoom: number;
  onElementSelect: (id: string) => void;
  onElementUpdate: (id: string, updates: Partial<TemplateElement>) => void;
  onElementAdd: (element: TemplateElement) => void;
}
```

**Features:**
- DnD context for drag-and-drop
- Zoom controls
- Grid overlay
- Selection handling

#### ComponentsSidebar.tsx

Sidebar with available components and data fields.

**Features:**
- Draggable component items
- Data fields panel with search
- Grouped by category
- Copy placeholder on click

#### PropertiesPanel.tsx

Properties panel for editing selected element.

**Props:**
```typescript
interface PropertiesPanelProps {
  selectedElement?: TemplateElement;
  onUpdate: (updates: Partial<TemplateElement>) => void;
  onDelete: () => void;
}
```

**Features:**
- Dynamic property editors based on element type
- Real-time updates
- Validation feedback


### Element Renderers

Each element type has two renderers:
1. **Canvas Renderer**: For editing in Template Builder
2. **PDF Renderer**: For generating PDF output

#### Canvas Renderer Example

```tsx
// components/rapor/builder/elements/TextElementRenderer.tsx
interface TextElementRendererProps {
  element: TextElement;
  isSelected: boolean;
}

export function TextElementRenderer({ element, isSelected }: TextElementRendererProps) {
  return (
    <div
      style={{
        fontSize: element.style.fontSize,
        fontWeight: element.style.fontWeight,
        color: element.style.color,
        textAlign: element.style.textAlign,
        // ... other styles
      }}
      className={isSelected ? 'ring-2 ring-blue-500' : ''}
    >
      {element.content.text}
    </div>
  );
}
```

#### PDF Renderer Example

```tsx
// lib/rapor/pdf-elements/TextPDFElement.tsx
import { Text, View } from '@react-pdf/renderer';

interface TextPDFElementProps {
  element: TextElement;
  data: DataBindingSchema;
}

export function TextPDFElement({ element, data }: TextPDFElementProps) {
  const resolvedText = resolvePlaceholders(element.content.text, data);
  
  return (
    <View
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
      }}
    >
      <Text
        style={{
          fontSize: element.style.fontSize,
          fontWeight: element.style.fontWeight,
          color: element.style.color,
          textAlign: element.style.textAlign,
        }}
      >
        {resolvedText}
      </Text>
    </View>
  );
}
```

---

## State Management

### Zustand Store

The template builder uses Zustand for state management.

**Store Structure:**
```typescript
// store/templateBuilderStore.ts
interface TemplateBuilderState {
  // Template data
  template: TemplateConfig | null;
  elements: TemplateElement[];
  
  // UI state
  selectedElementId: string | null;
  zoom: number;
  isDragging: boolean;
  
  // History
  history: TemplateElement[][];
  historyIndex: number;
  
  // Actions
  setTemplate: (template: TemplateConfig) => void;
  setElements: (elements: TemplateElement[]) => void;
  
  addElement: (element: TemplateElement) => void;
  updateElement: (id: string, updates: Partial<TemplateElement>) => void;
  deleteElement: (id: string) => void;
  reorderElements: (elementIds: string[]) => void;
  
  selectElement: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  
  undo: () => void;
  redo: () => void;
  
  // Persistence
  saveToServer: () => Promise<void>;
  loadFromServer: (templateId: string) => Promise<void>;
}
```

**Usage:**
```tsx
import { useTemplateBuilderStore } from '@/store/templateBuilderStore';

function MyComponent() {
  const { elements, addElement, updateElement } = useTemplateBuilderStore();
  
  const handleAddText = () => {
    addElement({
      id: generateId(),
      type: 'text',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      content: { text: 'New Text' },
      style: { fontSize: 14, color: '#000000' },
      zIndex: elements.length,
      isVisible: true,
      isLocked: false,
    });
  };
  
  return (
    <button onClick={handleAddText}>Add Text</button>
  );
}
```

### History Management

Undo/redo is implemented using a history stack:

```typescript
// In store
const addToHistory = (state: TemplateBuilderState) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push([...state.elements]);
  
  return {
    history: newHistory.slice(-50), // Keep last 50 states
    historyIndex: newHistory.length - 1,
  };
};

// Undo action
undo: () => {
  set((state) => {
    if (state.historyIndex > 0) {
      return {
        historyIndex: state.historyIndex - 1,
        elements: state.history[state.historyIndex - 1],
      };
    }
    return state;
  });
},

// Redo action
redo: () => {
  set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      return {
        historyIndex: state.historyIndex + 1,
        elements: state.history[state.historyIndex + 1],
      };
    }
    return state;
  });
},
```

---

## PDF Generation

### PDF Generator Core

The PDF generator uses React-PDF to render elements.

**Main Generator Function:**
```typescript
// lib/rapor/builder-pdf-generator.ts
import { Document, Page, pdf } from '@react-pdf/renderer';

export async function generatePDF(
  template: TemplateConfig,
  elements: TemplateElement[],
  data: DataBindingSchema
): Promise<Blob> {
  // Sort elements by z-index
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  
  // Create PDF document
  const doc = (
    <Document>
      <Page
        size={template.pageSize}
        orientation={template.orientation}
        style={{
          backgroundColor: template.backgroundColor,
          padding: `${template.margins.top}mm ${template.margins.right}mm ${template.margins.bottom}mm ${template.margins.left}mm`,
        }}
      >
        {sortedElements.map((element) => (
          <ElementRenderer
            key={element.id}
            element={element}
            data={data}
          />
        ))}
      </Page>
    </Document>
  );
  
  // Generate blob
  const blob = await pdf(doc).toBlob();
  return blob;
}
```

**Element Renderer:**
```typescript
function ElementRenderer({ element, data }: { element: TemplateElement; data: DataBindingSchema }) {
  switch (element.type) {
    case 'header':
      return <HeaderPDFElement element={element as HeaderElement} data={data} />;
    case 'text':
      return <TextPDFElement element={element as TextElement} data={data} />;
    case 'data-table':
      return <DataTablePDFElement element={element as DataTableElement} data={data} />;
    case 'image':
      return <ImagePDFElement element={element as ImageElement} data={data} />;
    case 'image-gallery':
      return <ImageGalleryPDFElement element={element as ImageGalleryElement} data={data} />;
    case 'signature':
      return <SignaturePDFElement element={element as SignatureElement} data={data} />;
    case 'line':
      return <LinePDFElement element={element as LineElement} data={data} />;
    default:
      return null;
  }
}
```

### Image Handling

Images need special handling for PDF generation:

```typescript
// lib/rapor/image-handler.ts
export async function prepareImageForPDF(imageUrl: string): Promise<string> {
  try {
    // Fetch image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Convert to base64
    const base64 = await blobToBase64(blob);
    
    return base64;
  } catch (error) {
    console.error('Failed to load image:', error);
    // Return placeholder or empty string
    return '';
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

### Batch Processing

For bulk generation, process in batches:

```typescript
// lib/rapor/batch-processor.ts
export async function processBatch(
  templateId: string,
  siswaIds: string[],
  periode: Periode,
  onProgress: (progress: Progress) => void
): Promise<Result[]> {
  const BATCH_SIZE = 10;
  const results: Result[] = [];
  
  for (let i = 0; i < siswaIds.length; i += BATCH_SIZE) {
    const batch = siswaIds.slice(i, i + BATCH_SIZE);
    
    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map((siswaId) => generateSinglePDF(templateId, siswaId, periode))
    );
    
    // Collect results
    batchResults.forEach((result, index) => {
      const siswaId = batch[index];
      if (result.status === 'fulfilled') {
        results.push({
          siswaId,
          status: 'completed',
          pdfUrl: result.value.pdfUrl,
        });
      } else {
        results.push({
          siswaId,
          status: 'failed',
          error: result.reason.message,
        });
      }
    });
    
    // Report progress
    onProgress({
      total: siswaIds.length,
      completed: results.length,
      failed: results.filter((r) => r.status === 'failed').length,
    });
  }
  
  return results;
}
```


---

## Data Binding System

### Placeholder Syntax

Placeholders use double curly braces: `{{source.field}}`

**Examples:**
- `{{siswa.nama}}` → Student name
- `{{habit.ubudiyah.average}}` → Ubudiyah average score
- `{{school.nama}}` → School name

### Placeholder Resolver

The resolver replaces placeholders with actual data:

```typescript
// lib/rapor/placeholder-resolver.ts
export function resolvePlaceholders(
  text: string,
  data: DataBindingSchema
): string {
  // Match all {{...}} patterns
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  
  return text.replace(placeholderRegex, (match, path) => {
    // Split path: "siswa.nama" → ["siswa", "nama"]
    const keys = path.trim().split('.');
    
    // Navigate through data object
    let value: any = data;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Path not found, return original placeholder
        return match;
      }
    }
    
    // Convert value to string
    if (value === null || value === undefined) {
      return '';
    }
    
    return String(value);
  });
}
```

**Usage:**
```typescript
const text = "Nama: {{siswa.nama}}, Kelas: {{siswa.kelas}}";
const data = {
  siswa: {
    nama: "Ahmad Fauzi",
    kelas: "7A",
  },
};

const resolved = resolvePlaceholders(text, data);
// Result: "Nama: Ahmad Fauzi, Kelas: 7A"
```

### Data Fetcher

Fetches all required data for PDF generation:

```typescript
// lib/rapor/data-fetcher.ts
export async function fetchDataForPDF(
  siswaId: string,
  periode: Periode
): Promise<DataBindingSchema> {
  // Fetch siswa data
  const siswa = await fetchSiswaData(siswaId);
  
  // Fetch habit tracker data
  const habitTracker = await fetchHabitTrackerData(siswaId, periode);
  
  // Calculate aggregates
  const habitWithAggregates = calculateHabitAggregates(habitTracker);
  
  // Fetch galeri kegiatan
  const galeriKegiatan = await fetchGaleriKegiatan(siswaId, periode);
  
  // Fetch school data
  const school = await fetchSchoolData(siswa.cabang);
  
  // Fetch pembina data
  const pembina = await fetchPembinaData(siswa.asrama);
  
  return {
    siswa,
    habit_tracker: habitWithAggregates,
    galeri_kegiatan: galeriKegiatan,
    school,
    pembina,
    periode,
  };
}
```

### Aggregate Calculations

Calculate habit tracker aggregates:

```typescript
function calculateHabitAggregates(habitData: HabitTrackerData[]) {
  const categories = ['ubudiyah', 'akhlaq', 'kedisiplinan', 'kebersihan'];
  const aggregates: any = {};
  
  categories.forEach((category) => {
    const categoryData = habitData.filter((d) => d.kategori === category);
    
    if (categoryData.length > 0) {
      const average = categoryData.reduce((sum, d) => sum + d.nilai, 0) / categoryData.length;
      const percentage = (average / 100) * 100;
      
      aggregates[category] = {
        average: Math.round(average * 10) / 10,
        percentage: Math.round(percentage),
        details: categoryData.map((d) => ({
          indikator: d.indikator,
          nilai: d.nilai,
          persentase: Math.round((d.nilai / 100) * 100),
        })),
      };
    } else {
      aggregates[category] = {
        average: 0,
        percentage: 0,
        details: [],
      };
    }
  });
  
  // Calculate overall average
  const overallAverage = categories.reduce((sum, cat) => sum + aggregates[cat].average, 0) / categories.length;
  aggregates.overall_average = Math.round(overallAverage * 10) / 10;
  aggregates.overall_percentage = Math.round(overallAverage);
  
  return aggregates;
}
```

---

## Adding New Element Types

To add a new element type, follow these steps:

### Step 1: Define TypeScript Interface

Add to `types/rapor-builder.ts`:

```typescript
interface MyNewElement extends BaseElement {
  type: 'my-new-element';
  content: {
    // Define content structure
    myField: string;
  };
  style: {
    // Define style properties
    myColor: string;
  };
}

// Add to union type
type TemplateElement = 
  | HeaderElement
  | TextElement
  | MyNewElement  // Add here
  | ...;
```

### Step 2: Create Canvas Renderer

Create `components/rapor/builder/elements/MyNewElementRenderer.tsx`:

```tsx
interface MyNewElementRendererProps {
  element: MyNewElement;
  isSelected: boolean;
}

export function MyNewElementRenderer({ element, isSelected }: MyNewElementRendererProps) {
  return (
    <div
      style={{
        color: element.style.myColor,
        // ... other styles
      }}
      className={isSelected ? 'ring-2 ring-blue-500' : ''}
    >
      {element.content.myField}
    </div>
  );
}
```

### Step 3: Create PDF Renderer

Create `lib/rapor/pdf-elements/MyNewPDFElement.tsx`:

```tsx
import { View, Text } from '@react-pdf/renderer';

interface MyNewPDFElementProps {
  element: MyNewElement;
  data: DataBindingSchema;
}

export function MyNewPDFElement({ element, data }: MyNewPDFElementProps) {
  const resolvedText = resolvePlaceholders(element.content.myField, data);
  
  return (
    <View
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
      }}
    >
      <Text style={{ color: element.style.myColor }}>
        {resolvedText}
      </Text>
    </View>
  );
}
```

### Step 4: Create Property Editor

Create `components/rapor/builder/properties/MyNewPropertyEditor.tsx`:

```tsx
interface MyNewPropertyEditorProps {
  element: MyNewElement;
  onUpdate: (updates: Partial<MyNewElement>) => void;
}

export function MyNewPropertyEditor({ element, onUpdate }: MyNewPropertyEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label>My Field</label>
        <input
          type="text"
          value={element.content.myField}
          onChange={(e) => onUpdate({
            content: { ...element.content, myField: e.target.value }
          })}
        />
      </div>
      
      <div>
        <label>My Color</label>
        <ColorPicker
          color={element.style.myColor}
          onChange={(color) => onUpdate({
            style: { ...element.style, myColor: color }
          })}
        />
      </div>
    </div>
  );
}
```

### Step 5: Register in Components Sidebar

Update `components/rapor/builder/ComponentsSidebar.tsx`:

```tsx
const AVAILABLE_COMPONENTS = [
  // ... existing components
  {
    type: 'my-new-element',
    label: 'My New Element',
    icon: MyIcon,
    defaultProps: {
      content: { myField: 'Default text' },
      style: { myColor: '#000000' },
    },
  },
];
```

### Step 6: Register in Renderers

Update `Canvas.tsx` and PDF generator to include new element:

```tsx
// In Canvas.tsx
function renderElement(element: TemplateElement) {
  switch (element.type) {
    // ... existing cases
    case 'my-new-element':
      return <MyNewElementRenderer element={element} />;
  }
}

// In builder-pdf-generator.ts
function ElementRenderer({ element, data }) {
  switch (element.type) {
    // ... existing cases
    case 'my-new-element':
      return <MyNewPDFElement element={element} data={data} />;
  }
}
```

### Step 7: Register in Properties Panel

Update `PropertiesPanel.tsx`:

```tsx
function renderPropertyEditor(element: TemplateElement) {
  switch (element.type) {
    // ... existing cases
    case 'my-new-element':
      return <MyNewPropertyEditor element={element} onUpdate={onUpdate} />;
  }
}
```

### Step 8: Add to Database Schema (Optional)

If the element type needs special database handling, update migrations.

### Step 9: Test

1. Test adding element in builder
2. Test editing properties
3. Test preview with sample data
4. Test PDF generation
5. Test with real data

---

## Testing

### Unit Tests

Test individual functions and utilities:

```typescript
// __tests__/placeholder-resolver.test.ts
import { resolvePlaceholders } from '@/lib/rapor/placeholder-resolver';

describe('resolvePlaceholders', () => {
  it('should resolve simple placeholders', () => {
    const text = 'Hello {{name}}';
    const data = { name: 'World' };
    expect(resolvePlaceholders(text, data)).toBe('Hello World');
  });
  
  it('should resolve nested placeholders', () => {
    const text = '{{siswa.nama}} - {{siswa.kelas}}';
    const data = { siswa: { nama: 'Ahmad', kelas: '7A' } };
    expect(resolvePlaceholders(text, data)).toBe('Ahmad - 7A');
  });
  
  it('should handle missing data', () => {
    const text = '{{missing.field}}';
    const data = {};
    expect(resolvePlaceholders(text, data)).toBe('{{missing.field}}');
  });
});
```

### Integration Tests

Test API endpoints:

```typescript
// __tests__/api/template-builder.test.ts
import { POST, GET } from '@/app/api/rapor/template/builder/route';

describe('Template Builder API', () => {
  it('should create new template', async () => {
    const request = new Request('http://localhost/api/rapor/template/builder', {
      method: 'POST',
      body: JSON.stringify({
        nama_template: 'Test Template',
        jenis_rapor: 'semester',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.nama_template).toBe('Test Template');
  });
});
```

### E2E Tests

Test complete workflows with Playwright or Cypress:

```typescript
// e2e/template-builder.spec.ts
import { test, expect } from '@playwright/test';

test('create and edit template', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  ```


});
isible();)).toBeVt=Saved'r('tex(page.locatoit expect
  awa;e")')-text("Sav'button:haspage.click(it 
  awa
  // Save
  xt');st TeTent"]', '-conteme="textge.fill('[nait pa awa
 t text
  // Edi 
  });
  },y: 100{ x: 100, ion: getPosittars', {
    xt', '.canvacomponent-teAndDrop('.e.dragt pag awai
 menteled text 
  // Ad
  ();toBeVisibles')).tor('.canva(page.locat expectd
  awailder to loait for bui
  
  // Wate")');plaat Tems-text("Bun:hatoutage.click('b
  await pder');Builte ext=Templa('tlickpage.cit wa');
  aester', 'semis_rapor"]en"jme=on('[natiectOpge.sel await palate');
 E Test Temp]', 'E2plate"_tem="namaname.fill('[ await pagem
 ll for/ Fi  
  /te Baru');
pla Temtext=Buat('e.click
  await pag;ate-rapor')or/templnajemen-rapoto('/maage.gt pawailder
  mplate bui to te // Navigate 
 mit"]');
 e="subbutton[typ('lick.cawait pageull 
|| value === undefined) {
      return '';
    }
    
    return String(value);
  });
}
```

**Usage:**
```typescript
const text = "Nama: {{siswa.nama}}, Kelas: {{siswa.kelas}}";
const data = {
  siswa: {
    nama: "Ahmad Fauzi",
    kelas: "7A",
  },
};

const resolved = resolvePlaceholders(text, data);
// Result: "Nama: Ahmad Fauzi, Kelas: 7A"
```

### Data Fetcher

Fetches all required data for PDF generation:

```typescript
// lib/rapor/data-fetcher.ts
export async function fetchDataForPDF(
  siswaId: string,
  periode: Periode
): Promise<DataBindingSchema> {
  // Fetch siswa data
  const siswa = await fetchSiswaData(siswaId);
  
  // Fetch habit tracker data
  const habitTracker = await fetchHabitTrackerData(siswaId, periode);
  
  // Calculate aggregates
  const habitWithAggregates = calculateHabitAggregates(habitTracker);
  
  // Fetch galeri kegiatan
  const galeriKegiatan = await fetchGaleriKegiatan(siswaId, periode);
  
  // Fetch school data
  const school = await fetchSchoolData(siswa.cabang);
  
  // Fetch pembina data
  const pembina = await fetchPembinaData(siswa.asrama);
  
  return {
    siswa,
    habit_tracker: habitWithAggregates,
    galeri_kegiatan: galeriKegiatan,
    school,
    pembina,
    periode,
  };
}
```

### Aggregate Calculations

Calculate habit tracker aggregates:

```typescript
function calculateHabitAggregates(habitData: HabitTrackerData[]) {
  const categories = ['ubudiyah', 'akhlaq', 'kedisiplinan', 'kebersihan'];
  const aggregates: any = {};
  
  categories.forEach((category) => {
    const categoryData = habitData.filter((d) => d.kategori === category);
    
    if (categoryData.length > 0) {
      const average = categoryData.reduce((sum, d) => sum + d.nilai, 0) / categoryData.length;
      const percentage = (average / 100) * 100;
      
      aggregates[category] = {
        average: Math.round(average * 10) / 10,
        percentage: Math.round(percentage),
        details: categoryData.map((d) => ({
          indikator: d.indikator,
          nilai: d.nilai,
          persentase: Math.round((d.nilai / 100) * 100),
        })),
      };
    } else {
      aggregates[category] = {
        average: 0,
        percentage: 0,
        details: [],
      };
    }
  });
  
  // Calculate overall average
  const overallAverage = categories.reduce((sum, cat) => sum + aggregates[cat].average, 0) / categories.length;
  aggregates.overall_average = Math.round(overallAverage * 10) / 10;
  aggregates.overall_percentage = Math.round(overallAverage);
  
  return aggregates;
}
```

---

## Adding New Element Types

To add a new element type, follow these steps:

### Step 1: Define TypeScript Interface

Add to `types/rapor-builder.ts`:

```typescript
interface MyNewElement extends BaseElement {
  type: 'my-new-element';
  content: {
    // Define content structure
    myField: string;
  };
  style: {
    // Define style properties
    myColor: string;
  };
}

// Add to union type
type TemplateElement = 
  | HeaderElement
  | TextElement
  | MyNewElement  // Add here
  | ...;
```

### Step 2: Create Canvas Renderer

Create `components/rapor/builder/elements/MyNewElementRenderer.tsx`:

```tsx
interface MyNewElementRendererProps {
  element: MyNewElement;
  isSelected: boolean;
}

export function MyNewElementRenderer({ element, isSelected }: MyNewElementRendererProps) {
  return (
    <div
      style={{
        color: element.style.myColor,
        // ... other styles
      }}
      className={isSelected ? 'ring-2 ring-blue-500' : ''}
    >
      {element.content.myField}
    </div>
  );
}
```

### Step 3: Create PDF Renderer

Create `lib/rapor/pdf-elements/MyNewPDFElement.tsx`:

```tsx
import { View, Text } from '@react-pdf/renderer';

interface MyNewPDFElementProps {
  element: MyNewElement;
  data: DataBindingSchema;
}

export function MyNewPDFElement({ element, data }: MyNewPDFElementProps) {
  const resolvedText = resolvePlaceholders(element.content.myField, data);
  
  return (
    <View
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
      }}
    >
      <Text style={{ color: element.style.myColor }}>
        {resolvedText}
      </Text>
    </View>
  );
}
```

### Step 4: Create Property Editor

Create `components/rapor/builder/properties/MyNewPropertyEditor.tsx`:

```tsx
interface MyNewPropertyEditorProps {
  element: MyNewElement;
  onUpdate: (updates: Partial<MyNewElement>) => void;
}

export function MyNewPropertyEditor({ element, onUpdate }: MyNewPropertyEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label>My Field</label>
        <input
          type="text"
          value={element.content.myField}
          onChange={(e) => onUpdate({
            content: { ...element.content, myField: e.target.value }
          })}
        />
      </div>
      
      <div>
        <label>My Color</label>
        <ColorPicker
          color={element.style.myColor}
          onChange={(color) => onUpdate({
            style: { ...element.style, myColor: color }
          })}
        />
      </div>
    </div>
  );
}
```

### Step 5: Register in Components Sidebar

Update `components/rapor/builder/ComponentsSidebar.tsx`:

```tsx
const AVAILABLE_COMPONENTS = [
  // ... existing components
  {
    type: 'my-new-element',
    label: 'My New Element',
    icon: MyIcon,
    defaultProps: {
      content: { myField: 'Default text' },
      style: { myColor: '#000000' },
    },
  },
];
```

### Step 6: Register in Renderers

Update `Canvas.tsx` and PDF generator to include new element:

```tsx
// In Canvas.tsx
function renderElement(element: TemplateElement) {
  switch (element.type) {
    // ... existing cases
    case 'my-new-element':
      return <MyNewElementRenderer element={element} />;
  }
}

// In builder-pdf-generator.ts
function ElementRenderer({ element, data }) {
  switch (element.type) {
    // ... existing cases
    case 'my-new-element':
      return <MyNewPDFElement element={element} data={data} />;
  }
}
```

### Step 7: Register in Properties Panel

Update `PropertiesPanel.tsx`:

```tsx
function renderPropertyEditor(element: TemplateElement) {
  switch (element.type) {
    // ... existing cases
    case 'my-new-element':
      return <MyNewPropertyEditor element={element} onUpdate={onUpdate} />;
  }
}
```

### Step 8: Test

1. Test adding element in builder
2. Test editing properties
3. Test preview with sample data
4. Test PDF generation
5. Test with real data

---

## Testing

### Unit Tests

Test individual functions and utilities:

```typescript
// __tests__/placeholder-resolver.test.ts
import { resolvePlaceholders } from '@/lib/rapor/placeholder-resolver';

describe('resolvePlaceholders', () => {
  it('should resolve simple placeholders', () => {
    const text = 'Hello {{name}}';
    const data = { name: 'World' };
    expect(resolvePlaceholders(text, data)).toBe('Hello World');
  });
  
  it('should resolve nested placeholders', () => {
    const text = '{{siswa.nama}} - {{siswa.kelas}}';
    const data = { siswa: { nama: 'Ahmad', kelas: '7A' } };
    expect(resolvePlaceholders(text, data)).toBe('Ahmad - 7A');
  });
  
  it('should handle missing data', () => {
    const text = '{{missing.field}}';
    const data = {};
    expect(resolvePlaceholders(text, data)).toBe('{{missing.field}}');
  });
});
```

### Integration Tests

Test API endpoints:

```typescript
// __tests__/api/template-builder.test.ts
import { POST, GET } from '@/app/api/rapor/template/builder/route';

describe('Template Builder API', () => {
  it('should create new template', async () => {
    const request = new Request('http://localhost/api/rapor/template/builder', {
      method: 'POST',
      body: JSON.stringify({
        nama_template: 'Test Template',
        jenis_rapor: 'semester',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.nama_template).toBe('Test Template');
  });
});
```

### E2E Tests

Test complete workflows with Playwright:

```typescript
// e2e/template-builder.spec.ts
import { test, expect } from '@playwright/test';

test('create and edit template', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to template builder
  await page.goto('/manajemen-rapor/template-rapor');
  await page.click('text=Buat Template Baru');
  
  // Fill form
  await page.fill('[name="nama_template"]', 'E2E Test Template');
  await page.selectOption('[name="jenis_rapor"]', 'semester');
  await page.click('text=Template Builder');
  await page.click('button:has-text("Buat Template")');
  
  // Wait for builder to load
  await expect(page.locator('.canvas')).toBeVisible();
  
  // Add text element
  await page.dragAndDrop('.component-text', '.canvas', {
    targetPosition: { x: 100, y: 100 },
  });
  
  // Edit text
  await page.fill('[name="text-content"]', 'Test Text');
  
  // Save
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Saved')).toBeVisible();
});
```

---

## Deployment

### Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=rapor-pdfs
```

### Database Migration

Run the migration script:

```bash
psql -h your_host -U your_user -d your_db -f supabase/SETUP_TEMPLATE_BUILDER.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### Build and Deploy

```bash
# Install dependencies
npm install

# Build
npm run build

# Start production server
npm start
```

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Performance Optimization

**For Production:**

1. **Enable Caching**
   - Cache template configs in Redis
   - Cache data schema
   - Cache preview data

2. **Optimize Images**
   - Use Next.js Image component
   - Compress uploaded images
   - Use CDN for assets

3. **Database Optimization**
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Implement query caching

4. **PDF Generation**
   - Use worker threads for parallel processing
   - Implement queue system (Bull, BullMQ)
   - Cache generated PDFs

### Monitoring

**Recommended Tools:**

- **Sentry**: Error tracking
- **Vercel Analytics**: Performance monitoring
- **Supabase Dashboard**: Database monitoring
- **LogRocket**: Session replay

### Backup Strategy

1. **Database Backups**
   - Daily automated backups via Supabase
   - Weekly manual backups
   - Keep backups for 30 days

2. **Storage Backups**
   - Sync PDFs to external storage (S3, Google Cloud)
   - Keep backups for 1 year

3. **Code Backups**
   - Git repository (GitHub)
   - Tagged releases

---

## Security Considerations

### Authentication

- All API routes require authentication
- Use Supabase Auth for user management
- Implement RLS policies for data access

### Authorization

- Check user permissions before operations
- Validate user belongs to correct cabang
- Implement role-based access control

### Input Validation

- Validate all user inputs
- Sanitize HTML content
- Validate file uploads (type, size)
- Use Zod for schema validation

### Data Privacy

- Student data is private
- PDFs are accessible only by authorized users
- Implement secure file URLs with expiry
- Log all access to sensitive data

### SQL Injection Prevention

- Use parameterized queries
- Use Supabase client (handles escaping)
- Never concatenate user input in queries

### XSS Prevention

- Sanitize user input before rendering
- Use React (auto-escapes by default)
- Validate placeholder syntax
- Escape HTML in PDF generation

---

## Troubleshooting

### Common Issues

#### PDF Generation Fails

**Symptoms:**
- Error during PDF generation
- Blank PDF
- Missing images

**Solutions:**
1. Check image URLs are accessible
2. Verify data bindings are correct
3. Check element positions are within bounds
4. Review server logs for errors

#### Template Not Saving

**Symptoms:**
- Save button doesn't work
- Changes not persisted
- Error message on save

**Solutions:**
1. Check network connection
2. Verify authentication token
3. Check RLS policies
4. Review browser console for errors

#### Slow Performance

**Symptoms:**
- Builder is laggy
- PDF generation is slow
- Preview takes long time

**Solutions:**
1. Reduce number of elements
2. Optimize images
3. Simplify data queries
4. Enable caching

---

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Pull Request Process

1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation
4. Submit PR with description
5. Address review comments
6. Merge after approval

### Versioning

Follow Semantic Versioning (SemVer):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

---

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React-PDF Documentation](https://react-pdf.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [DnD Kit Documentation](https://docs.dndkit.com/)

### Examples

- Example templates in `examples/` directory
- Sample data in `examples/sample-data.json`
- Video tutorials on YouTube

### Support

- GitHub Issues: Report bugs
- Discussions: Ask questions
- Email: support@example.com

---

**Last Updated:** November 8, 2025
**Version:** 1.0.0
