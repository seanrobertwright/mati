#!/usr/bin/env powershell

# Start port forward to Supabase database
Write-Host "Starting port forward to Supabase database..." -ForegroundColor Green

# Check if container already exists
$existing = docker ps -a --filter "name=supabase-db-forward" --format "{{.Names}}"
if ($existing -eq "supabase-db-forward") {
    Write-Host "Removing existing port forward container..." -ForegroundColor Yellow
    docker rm -f supabase-db-forward | Out-Null
}

# Create new port forward
docker run -d --name supabase-db-forward --network localai_default -p 54322:5432 alpine/socat tcp-listen:5432,fork,reuseaddr tcp-connect:supabase-db:5432

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Port forward active: localhost:54322 -> supabase-db:5432" -ForegroundColor Green
    Write-Host "Update your .env.local to use:" -ForegroundColor Cyan
    Write-Host "DATABASE_URL=postgresql://postgres:Muadi70!!@127.0.0.1:54322/postgres" -ForegroundColor White
} else {
    Write-Host "❌ Failed to create port forward" -ForegroundColor Red
}