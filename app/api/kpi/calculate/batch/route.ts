import { NextRequest, NextResponse } from 'next/server';
import { calculateKPIBatch, saveKPIResult } from '@/lib/kpi-calculation';

// POST /api/kpi/calculate/batch
// Calculate KPI for all musyrif in all cabang (batch)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bulan, tahun } = body;

    // Validation
    if (!bulan || !tahun) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: bulan, tahun' },
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

    // Calculate KPI for all musyrif
    const kpiResults = await calculateKPIBatch(bulan, tahun);

    // Save all results to database
    let savedCount = 0;
    let failedCount = 0;

    for (const kpiResult of kpiResults) {
      const saved = await saveKPIResult(kpiResult);
      if (saved) {
        savedCount++;
      } else {
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: kpiResults.length,
        saved: savedCount,
        failed: failedCount,
        results: kpiResults,
      },
      message: `Batch calculation complete: ${savedCount} saved, ${failedCount} failed`,
    });
  } catch (error: any) {
    console.error('Error in batch calculation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
