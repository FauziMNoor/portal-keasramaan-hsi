import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

// GET - List all versions with metadata
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if template exists
    const { data: template, error: templateError } = await supabase
      .from('rapor_template_keasramaan')
      .select('id, nama_template, template_type')
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

    // Fetch all versions sorted by version number descending
    const { data: versions, error: versionsError } = await supabase
      .from('rapor_template_versions_keasramaan')
      .select('id, version_number, notes, created_by, created_at')
      .eq('template_id', id)
      .order('version_number', { ascending: false });

    if (versionsError) throw versionsError;

    // Fetch creator names if available
    const versionsWithCreator = await Promise.all(
      (versions || []).map(async (version) => {
        if (version.created_by) {
          const { data: creator } = await supabase
            .from('guru')
            .select('nama')
            .eq('id', version.created_by)
            .single();

          return {
            ...version,
            created_by_name: creator?.nama || 'Unknown',
          };
        }
        return {
          ...version,
          created_by_name: 'Unknown',
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        template_id: id,
        template_name: template.nama_template,
        versions: versionsWithCreator,
        total_versions: versionsWithCreator.length,
      },
    });
  } catch (error: any) {
    console.error('Get versions error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
