# Build and Push Scripts

These scripts allow you to build and push Docker images to GHCR without using GitHub Actions.

## Windows (PowerShell)

```powershell
# Set your GitHub token
$env:GITHUB_TOKEN = "your_github_pat_token"

# Run the script
.\scripts\build-and-push.ps1
```

Or pass token directly:
```powershell
.\scripts\build-and-push.ps1 -Token "your_github_pat_token"
```

## Linux/Mac (Bash)

```bash
# Make script executable
chmod +x scripts/build-and-push.sh

# Set your GitHub token
export GITHUB_TOKEN="your_github_pat_token"

# Run the script
./scripts/build-and-push.sh
```

Or pass token directly:
```bash
./scripts/build-and-push.sh "your_github_pat_token"
```

## Getting a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Docker Push")
4. Select scope: `write:packages`
5. Click "Generate token"
6. Copy the token (you won't see it again!)

## Manual Steps (Alternative)

If you prefer to run commands manually:

```bash
# 1. Login to GHCR
echo "YOUR_TOKEN" | docker login ghcr.io -u atharvkhisti --password-stdin

# 2. Build images
docker build -f docker/ai.Dockerfile -t ghcr.io/atharvkhisti/olym-pose-ai:latest .
docker build -f docker/web.Dockerfile -t ghcr.io/atharvkhisti/olym-pose-web:latest .

# 3. Push images
docker push ghcr.io/atharvkhisti/olym-pose-ai:latest
docker push ghcr.io/atharvkhisti/olym-pose-web:latest
```

