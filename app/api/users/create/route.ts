import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Check if user is logged in
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email, password, nama_lengkap, role, lokasi, asrama, no_telepon, is_active, foto } = await request.json();

    // Validasi input
    if (!email || !password || !nama_lengkap || !role) {
      return NextResponse.json(
        { error: 'Email, password, nama lengkap, dan role harus diisi' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users_keasramaan')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert user
    const { data, error } = await supabase
      .from('users_keasramaan')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        nama_lengkap,
        role,
        lokasi: lokasi || null,
        asrama: asrama || null,
        no_telepon: no_telepon || null,
        foto: foto || null,
        is_active: is_active !== undefined ? is_active : true,
        created_by: session.userId,
      })
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
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
