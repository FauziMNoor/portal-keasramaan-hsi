import { NextRequest, NextResponse } from 'next/server';
import { calculateKPIMusyrif, saveKPIResult } from '@/lib/kpi-calculation';

// POST /api/kpi/calculate/musyrif
// Calculate KPI for a single musyrif
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_musyrif, cabang, asrama, bulan, tahun } = body;

    // Validation
    if (!nama_musyrif || !cabang || !asrama || !bulan || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: nama_musyrif, cabang, asrama, bulan, tahun' },
        { status: 400 }
      );
    }

    // Validate bulan (1-12)
    if (bulan < 1 || bulan > 12) {
      return NextResponse.json(
        { success: false, error: 'Bulan must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Calculate KPI
    const kpiResult = await calculateKPIMusyrif(nama_musyrif, cabang, asrama, bulan, tahun);

    // Save to database
    const saved = await saveKPIResult(kpiResult);

    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save KPI result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: kpiResult,
      message: 'KPI berhasil dihitung dan disimpan',
    });
  } catch (error: any) {
    console.error('Error calculating KPI:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
