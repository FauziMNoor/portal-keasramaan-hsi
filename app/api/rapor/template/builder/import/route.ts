import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { TemplateConfigSchema, TemplateElementSchema } from '@/types/rapor-builder';
import { z } from 'zod';

// Schema for validating import file structure
const ImportFileSchema = z.object({
  exportVersion: z.string(),
  exportedAt: z.string(),
  exportedBy: z.string().optional(),
  metadata: z.object({
    name: z.string(),
    jenis_rapor: z.string(),
    version: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    created_by: z.string().optional(),
  }),
  template: z.object({
    canvas_config: z.any(), // Will be validated separately with TemplateConfigSchema
    elements: z.array(z.any()), // Will be validated separately with TemplateElementSchema
  }),
  versionHistory: z.array(z.any()).optional(),
});

// POST - Import template from JSON file
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'File harus berformat JSON' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();
    let importData;

    try {
      importData = JSON.parse(fileContent);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'File JSON tidak valid' },
        { status: 400 }
      );
    }

    // Validate file structure
    let validatedData;
    try {
      validatedData = ImportFileSchema.parse(importData);
    } catch (validationError: any) {
      return NextResponse.json(
        {
          error: 'Struktur file tidak valid',
          details: validationError.errors,
        },
        { status: 400 }
      );
    }

    // Validate canvas_config
    let canvasConfig;
    try {
      // Remove id from canvas_config as we'll generate a new one
      const { id, ...configWithoutId } = validatedData.template.canvas_config;
      canvasConfig = configWithoutId;
    } catch (error) {
      canvasConfig = validatedData.template.canvas_config;
    }

    // Validate elements
    const validatedElements = [];
    const invalidElements = [];

    for (let i = 0; i < validatedData.template.elements.length; i++) {
      const element = validatedData.template.elements[i];
      try {
        // Remove id as we'll generate new ones
        const { id, ...elementWithoutId } = element;
        const validated = TemplateElementSchema.parse(element);
        validatedElements.push(elementWithoutId);
      } catch (error: any) {
        invalidElements.push({
          index: i,
          element: element,
          error: error.errors || error.message,
        });
      }
    }

    // If there are invalid elements, return warnings but continue
    const warnings = [];
    if (invalidElements.length > 0) {
      warnings.push({
        type: 'invalid_elements',
        message: `${invalidElements.length} elemen tidak valid dan akan dilewati`,
        details: invalidElements,
      });
    }

    // Create new template name (append " (Imported)" if not already present)
    let newTemplateName = validatedData.metadata.name;
    if (!newTemplateName.includes('(Imported)')) {
      newTemplateName = `${newTemplateName} (Imported)`;
    }

    const now = new Date().toISOString();

    // Prepare new template data
    const newTemplateData = {
      nama_template: newTemplateName,
      jenis_rapor: validatedData.metadata.jenis_rapor,
      template_type: 'builder',
      canvas_config: canvasConfig
        ? {
            ...canvasConfig,
            metadata: {
              ...canvasConfig.metadata,
              createdAt: now,
              updatedAt: now,
              createdBy: session.userId,
              lastEditedBy: session.userId,
            },
          }
        : null,
      is_active: false, // Imported templates are not active by default
      created_by: session.userId,
    };

    // Insert new template
    const { data: newTemplate, error: insertTemplateError } = await supabase
      .from('rapor_template_keasramaan')
      .insert(newTemplateData)
      .select()
      .single();

    if (insertTemplateError) throw insertTemplateError;

    // Insert elements with new template_id
    if (validatedElements.length > 0) {
      const newElements = validatedElements.map((element) => ({
        template_id: newTemplate.id,
        element_type: element.type,
        position: element.position,
        size: element.size,
        content: (element as any).content,
        style: (element as any).style,
        data_binding: (element as any).dataBinding,
        z_index: element.zIndex,
        is_visible: element.isVisible,
        is_locked: element.isLocked,
      }));

      const { error: insertElementsError } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert(newElements);

      if (insertElementsError) throw insertElementsError;
    }

    // Fetch the complete imported template with elements
    const { data: elements } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', newTemplate.id)
      .order('z_index', { ascending: true });

    return NextResponse.json({
      success: true,
      message: 'Template berhasil diimpor',
      data: {
        template: newTemplate,
        elements: elements || [],
      },
      warnings: warnings.length > 0 ? warnings : undefined,
      stats: {
        totalElements: validatedData.template.elements.length,
        importedElements: validatedElements.length,
        skippedElements: invalidElements.length,
      },
    });
  } catch (error: any) {
    console.error('Import builder template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
