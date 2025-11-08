import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// POST - Restore template to specific version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json(
        { error: 'versionId is required' },
        { status: 400 }
      );
    }

    // Check if template exists
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('id, template_type')
      .eq('id', id)
      .eq('template_type', 'builder')
      .single();

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template tidak ditemukan' },
          { status: 404 }
        );
      }
      throw templateError;
    }

    // Fetch the version to restore
    const { data: version, error: versionError } = await supabase
      .from('rapor_template_versions_keasramaan')
      .select('*')
      .eq('id', versionId)
      .eq('template_id', id)
      .single();

    if (versionError) {
      if (versionError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Version tidak ditemukan' },
          { status: 404 }
        );
      }
      throw versionError;
    }

    // Step 1: Save current state as a new version before restoring
    // Get current template state
    const { data: currentTemplate, error: currentTemplateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('canvas_config')
      .eq('id', id)
      .single();

    if (currentTemplateError) throw currentTemplateError;

    // Get current elements
    const { data: currentElements, error: currentElementsError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', id)
      .order('z_index', { ascending: true });

    if (currentElementsError) throw currentElementsError;

    // Get latest version number
    const { data: latestVersion, error: latestVersionError } = await supabase
      .from('rapor_template_versions_keasramaan')
      .select('version_number')
      .eq('template_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestVersionError) throw latestVersionError;

    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

    // Save current state as new version
    const { error: saveCurrentError } = await supabase
      .from('rapor_template_versions_keasramaan')
      .insert({
        template_id: id,
        version_number: newVersionNumber,
        canvas_config: currentTemplate.canvas_config,
        elements: currentElements || [],
        notes: `Auto-saved before restoring to version ${version.version_number}`,
        created_by: session.userId,
      });

    if (saveCurrentError) throw saveCurrentError;

    // Step 2: Update template canvas_config with version data
    const { error: updateTemplateError } = await supabase
      .from('rapor_template_keasramaan')
      .update({
        canvas_config: {
          ...version.canvas_config,
          metadata: {
            ...version.canvas_config?.metadata,
            updatedAt: new Date().toISOString(),
            lastEditedBy: session.userId,
            restoredFrom: version.version_number,
          },
        },
      })
      .eq('id', id);

    if (updateTemplateError) throw updateTemplateError;

    // Step 3: Delete all current elements
    const { error: deleteElementsError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .delete()
      .eq('template_id', id);

    if (deleteElementsError) throw deleteElementsError;

    // Step 4: Insert elements from version snapshot
    if (version.elements && Array.isArray(version.elements) && version.elements.length > 0) {
      // Prepare elements for insertion (remove id to generate new ones)
      const elementsToInsert = version.elements.map((element: any) => {
        const { id: _id, created_at, updated_at, ...elementData } = element;
        return {
          ...elementData,
          template_id: id,
        };
      });

      const { error: insertElementsError } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert(elementsToInsert);

      if (insertElementsError) throw insertElementsError;
    }

    // Step 5: Create a new version entry for the restore action
    const { data: restoreVersion, error: restoreVersionError } = await supabase
      .from('rapor_template_versions_keasramaan')
      .insert({
        template_id: id,
        version_number: newVersionNumber + 1,
        canvas_config: version.canvas_config,
        elements: version.elements,
        notes: `Restored from version ${version.version_number}`,
        created_by: session.userId,
      })
      .select()
      .single();

    if (restoreVersionError) throw restoreVersionError;

    return NextResponse.json({
      success: true,
      data: {
        restored_from_version: version.version_number,
        new_version_number: restoreVersion.version_number,
        elements_restored: version.elements?.length || 0,
      },
      message: `Template berhasil dikembalikan ke version ${version.version_number}`,
    });
  } catch (error: any) {
    console.error('Restore version error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
