import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// POST - Save current template state as new version
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
    const { notes } = body;

    // Fetch current template
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('id, canvas_config, template_type')
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

    // Fetch all current elements
    const { data: elements, error: elementsError } = await supabase
      .from('rapor_template_elements_keasramaan')
      .select('*')
      .eq('template_id', id)
      .order('z_index', { ascending: true });

    if (elementsError) throw elementsError;

    // Get the latest version number
    const { data: latestVersion, error: versionError } = await supabase
      .from('rapor_template_versions_keasramaan')
      .select('version_number')
      .eq('template_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (versionError) throw versionError;

    // Increment version number
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

    // Create new version entry
    const { data: newVersion, error: insertError } = await supabase
      .from('rapor_template_versions_keasramaan')
      .insert({
        template_id: id,
        version_number: newVersionNumber,
        canvas_config: template.canvas_config,
        elements: elements || [],
        notes: notes || null,
        created_by: session.userId,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      data: {
        id: newVersion.id,
        version_number: newVersion.version_number,
        created_at: newVersion.created_at,
        notes: newVersion.notes,
      },
      message: `Version ${newVersionNumber} berhasil disimpan`,
    });
  } catch (error: any) {
    console.error('Save version error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
