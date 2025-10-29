import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch full user data including foto
    const { data: userData, error } = await supabase
      .from('users_keasramaan')
      .select('id, email, nama_lengkap, role, foto')
      .eq('id', session.userId)
      .single();

    if (error || !userData) {
      return NextResponse.json({
        user: {
          id: session.userId,
          email: session.email,
          nama: session.nama,
          role: session.role,
          foto: null,
        },
      });
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        nama: userData.nama_lengkap,
        role: userData.role,
        foto: userData.foto,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
