import { NextRequest, NextResponse } from 'next/server';
import { compileRaporData } from '@/lib/raporHelper';

// Test endpoint to check data compilation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nis, cabang, tahunAjaran, semester, kelas, asrama } = body;

    console.log('Testing compile with params:', { nis, cabang, tahunAjaran, semester, kelas, asrama });

    const result = await compileRaporData({
      nis,
      cabang,
      tahunAjaran,
      semester,
      kelas,
      asrama,
    });

    return NextResponse.json({
      success: result.success,
      message: result.message || 'Data compiled successfully',
      data: result.data,
      debug: {
        hasSantri: !!result.data?.santri,
        hasHabit: !!result.data?.habit,
        kegiatanCount: result.data?.kegiatan?.length || 0,
        dokumentasiCount: result.data?.dokumentasi?.length || 0,
        hasCatatan: !!result.data?.catatan,
      }
    });
  } catch (error: any) {
    console.error('Error in test compile:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
