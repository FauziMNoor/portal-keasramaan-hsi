import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { validateTemplateForm, formatValidationErrors } from '@/lib/rapor/validation';

// GET - List templates with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jenis_rapor = searchParams.get('jenis_rapor');
    const is_active = searchParams.get('is_active');

    let query = supabase
      .from('rapor_template_keasramaan')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (jenis_rapor) {
      query = query.eq('jenis_rapor', jenis_rapor);
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nama_template,
      jenis_rapor,
      ukuran_kertas_default,
      orientasi_default,
      is_active,
    } = body;

    // Validate using validation utility
    const validationErrors = validateTemplateForm({
      nama_template,
      jenis_rapor,
      ukuran_kertas_default,
      orientasi_default,
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: formatValidationErrors(validationErrors), errors: validationErrors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rapor_template_keasramaan')
      .insert({
        nama_template,
        jenis_rapor,
        ukuran_kertas_default: ukuran_kertas_default || 'A4',
        orientasi_default: orientasi_default || 'portrait',
        is_active: is_active !== undefined ? is_active : true,
        created_by: session.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
