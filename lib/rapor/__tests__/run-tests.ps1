# Test Runner Script for Rapor Utilities
# Run all unit tests

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running Rapor Utility Unit Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$testFiles = @(
    "placeholder-resolver.test.ts",
    "element-validator.test.ts",
    "template-validator.test.ts"
)

$totalPassed = 0
$totalFailed = 0

foreach ($testFile in $testFiles) {
    Write-Host "`nRunning $testFile..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    
    npx tsx "lib/rapor/__tests__/$testFile"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ $testFile PASSED" -ForegroundColor Green
    } else {
        Write-Host "`n✗ $testFile FAILED" -ForegroundColor Red
        $totalFailed++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($totalFailed -eq 0) {
    Write-Host "All test files passed! ✓" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$totalFailed test file(s) failed! ✗" -ForegroundColor Red
    exit 1
}
