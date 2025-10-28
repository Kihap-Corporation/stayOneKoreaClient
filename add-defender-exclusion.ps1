# Windows Defender 예외 추가 스크립트
# 관리자 권한으로 실행해야 합니다

$projectPath = Get-Location

Write-Host "Windows Defender 예외 추가 중..." -ForegroundColor Yellow
Write-Host "프로젝트 경로: $projectPath" -ForegroundColor Cyan

try {
    # .next 폴더 예외 추가
    Add-MpPreference -ExclusionPath "$projectPath\.next"
    Write-Host "✓ .next 폴더 예외 추가 완료" -ForegroundColor Green
    
    # node_modules 폴더 예외 추가
    Add-MpPreference -ExclusionPath "$projectPath\node_modules"
    Write-Host "✓ node_modules 폴더 예외 추가 완료" -ForegroundColor Green
    
    # 프로젝트 루트 예외 추가
    Add-MpPreference -ExclusionPath "$projectPath"
    Write-Host "✓ 프로젝트 루트 예외 추가 완료" -ForegroundColor Green
    
    Write-Host "`n모든 예외가 성공적으로 추가되었습니다!" -ForegroundColor Green
    Write-Host "이제 npm run dev 명령으로 서버를 시작하세요." -ForegroundColor Yellow
} catch {
    Write-Host "`n오류 발생: $_" -ForegroundColor Red
    Write-Host "관리자 권한으로 실행했는지 확인하세요." -ForegroundColor Yellow
}

Pause

