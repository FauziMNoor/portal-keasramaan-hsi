import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function PUT(request: NextRequest) {
  try {
    // Check if user is logged in
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, password, nama_lengkap, role, lokasi, asrama, no_telepon, is_active, foto } = await request.json();

    // Validasi input
    if (!id || !nama_lengkap || !role) {
      return NextResponse.json(
        { error: 'ID, nama lengkap, dan role harus diisi' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      nama_lengkap,
      role,
      lokasi: lokasi || null,
      asrama: asrama || null,
      no_telepon: no_telepon || null,
      is_active: is_active !== undefined ? is_active : true,
      updated_by: session.userId,
    };

    // Update foto if provided
    if (foto !== undefined) {
      updateData.foto = foto || null;
    }

    // If password is provided, hash it
    if (password && password.trim() !== '') {
      updateData.password_hash = await hashPassword(password);
    }

    // Update user
    const { data, error } = await supabase
      .from('users_keasramaan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        nama_lengkap: data.nama_lengkap,
        role: data.role,
      },
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
