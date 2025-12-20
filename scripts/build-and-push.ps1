# Build and push Docker images to GHCR manually (PowerShell)
# Usage: .\scripts\build-and-push.ps1 -Token YOUR_GITHUB_TOKEN

param(
    [Parameter(Mandatory=$false)]
    [string]$Token = $env:GITHUB_TOKEN
)

$ErrorActionPreference = "Stop"
$REGISTRY = "ghcr.io"
$USERNAME = "atharvkhisti"

if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "Error: GitHub token required" -ForegroundColor Red
    Write-Host "Usage: .\scripts\build-and-push.ps1 -Token YOUR_GITHUB_TOKEN"
    Write-Host "Or set GITHUB_TOKEN environment variable"
    exit 1
}

Write-Host "🔐 Logging in to GHCR..." -ForegroundColor Cyan
$Token | docker login $REGISTRY -u $USERNAME --password-stdin

Write-Host "🔨 Building AI image..." -ForegroundColor Cyan
docker build -f docker/ai.Dockerfile -t "$REGISTRY/$USERNAME/olym-pose-ai:latest" .

Write-Host "🔨 Building Web image..." -ForegroundColor Cyan
docker build -f docker/web.Dockerfile -t "$REGISTRY/$USERNAME/olym-pose-web:latest" .

Write-Host "📤 Pushing AI image..." -ForegroundColor Cyan
docker push "$REGISTRY/$USERNAME/olym-pose-ai:latest"

Write-Host "📤 Pushing Web image..." -ForegroundColor Cyan
docker push "$REGISTRY/$USERNAME/olym-pose-web:latest"

Write-Host "✅ Done! Images pushed successfully." -ForegroundColor Green
Write-Host ""
Write-Host "On your VPS, run:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml pull"
Write-Host "  docker-compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml up -d"

