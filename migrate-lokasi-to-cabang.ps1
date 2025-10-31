#!/usr/bin/env pwsh

# Script to migrate all "lokasi" references to "cabang"

$files = @(
  "app/lokasi/page.tsx",
  "app/users/page.tsx",
  "app/data-siswa/page.tsx",
  "app/asrama/page.tsx",
  "app/kepala-asrama/page.tsx",
  "app/musyrif/page.tsx",
  "app/habit-tracker/dashboard/page.tsx",
  "app/habit-tracker/form/[token]/page.tsx",
  "app/habit-tracker/manage-link/page.tsx",
  "app/habit-tracker/rekap/page.tsx",
  "app/habit-tracker/page.tsx",
  "app/overview/habit-tracker/components/FilterSection.tsx",
  "app/overview/habit-tracker/page.tsx",
  "app/manajemen-data/tempat/page.tsx",
  "app/page.tsx",
  "app/api/users/create/route.ts",
  "app/api/users/update/route.ts",
  "components/HabitTrackerStats.tsx"
)

$replacements = @(
  @{ Pattern = 'lokasi_keasramaan'; Replacement = 'cabang_keasramaan' },
  @{ Pattern = "lokasi'"; Replacement = "cabang'" },
  @{ Pattern = 'lokasi"'; Replacement = 'cabang"' },
  @{ Pattern = 'lokasi:'; Replacement = 'cabang:' },
  @{ Pattern = 'lokasi\?'; Replacement = 'cabang?' },
  @{ Pattern = 'lokasi,'; Replacement = 'cabang,' },
  @{ Pattern = 'lokasi\)'; Replacement = 'cabang)' },
  @{ Pattern = 'lokasi\}'; Replacement = 'cabang}' },
  @{ Pattern = 'lokasi\|'; Replacement = 'cabang|' },
  @{ Pattern = 'lokasi '; Replacement = 'cabang ' },
  @{ Pattern = 'lokasiList'; Replacement = 'cabangList' },
  @{ Pattern = 'LokasiPage'; Replacement = 'CabangPage' },
  @{ Pattern = 'interface Lokasi'; Replacement = 'interface Cabang' },
  @{ Pattern = '<Lokasi>'; Replacement = '<Cabang>' },
  @{ Pattern = '<Lokasi\[\]>'; Replacement = '<Cabang[]>' },
  @{ Pattern = 'Lokasi\[\]'; Replacement = 'Cabang[]' },
  @{ Pattern = 'Pilih Lokasi'; Replacement = 'Pilih Cabang' },
  @{ Pattern = 'pilih lokasi'; Replacement = 'pilih cabang' },
  @{ Pattern = 'Kelola data lokasi'; Replacement = 'Kelola data cabang' },
  @{ Pattern = 'Tambah Lokasi'; Replacement = 'Tambah Cabang' },
  @{ Pattern = 'Edit Lokasi'; Replacement = 'Edit Cabang' },
  @{ Pattern = 'Lokasi\s*\*'; Replacement = 'Cabang *' },
  @{ Pattern = '>Lokasi<'; Replacement = '>Cabang<' },
  @{ Pattern = 'Lokasi Dulu'; Replacement = 'Cabang Dulu' }
)

$updatedCount = 0

foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "Processing: $file" -ForegroundColor Cyan
    
    $content = Get-Content $file -Raw -Encoding UTF8
    $originalContent = $content
    
    foreach ($rep in $replacements) {
      $content = $content -replace $rep.Pattern, $rep.Replacement
    }
    
    if ($content -ne $originalContent) {
      Set-Content $file -Value $content -Encoding UTF8 -NoNewline
      Write-Host "  ✓ Updated" -ForegroundColor Green
      $updatedCount++
    } else {
      Write-Host "  - No changes" -ForegroundColor Gray
    }
  } else {
    Write-Host "  ✗ File not found: $file" -ForegroundColor Red
  }
}

Write-Host "`nMigration complete! Updated $updatedCount files." -ForegroundColor Green
Write-Host "`nNote: You may need to manually rename the folder app/lokasi to app/cabang if desired." -ForegroundColor Yellow
