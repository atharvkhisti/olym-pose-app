#!/bin/bash
# Build and push Docker images to GHCR manually
# Usage: ./scripts/build-and-push.sh [GITHUB_TOKEN]

set -e

GITHUB_TOKEN=${1:-${GITHUB_TOKEN}}
REGISTRY="ghcr.io"
USERNAME="atharvkhisti"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GitHub token required"
    echo "Usage: ./scripts/build-and-push.sh YOUR_GITHUB_TOKEN"
    echo "Or set GITHUB_TOKEN environment variable"
    exit 1
fi

echo "🔐 Logging in to GHCR..."
echo "$GITHUB_TOKEN" | docker login "$REGISTRY" -u "$USERNAME" --password-stdin

echo "🔨 Building AI image..."
docker build -f docker/ai.Dockerfile -t "$REGISTRY/$USERNAME/olym-pose-ai:latest" .

echo "🔨 Building Web image..."
docker build -f docker/web.Dockerfile -t "$REGISTRY/$USERNAME/olym-pose-web:latest" .

echo "📤 Pushing AI image..."
docker push "$REGISTRY/$USERNAME/olym-pose-ai:latest"

echo "📤 Pushing Web image..."
docker push "$REGISTRY/$USERNAME/olym-pose-web:latest"

echo "✅ Done! Images pushed successfully."
echo ""
echo "On your VPS, run:"
echo "  docker-compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml pull"
echo "  docker-compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml up -d"

