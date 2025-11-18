#!/usr/bin/env powershell

# Stop port forward to Supabase database
Write-Host "Stopping port forward to Supabase database..." -ForegroundColor Yellow

docker rm -f supabase-db-forward 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Port forward stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No port forward was running" -ForegroundColor Blue
}