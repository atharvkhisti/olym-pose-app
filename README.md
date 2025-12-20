# Olym Pose - AI Fitness Application

An AI-powered fitness application that uses pose detection to count exercise repetitions in real-time.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), shadcn/ui, MediaPipe Tasks Vision
- **Backend**: FastAPI, XGBoost/Random Forest for exercise classification
- **Auth**: NextAuth v5 + Google OAuth + MongoDB
- **Infrastructure**: Docker, Docker Compose, GitHub Actions CI

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (for containerized deployment)
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials

### Environment Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Fill in the required values in `.env`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
MONGODB_URI=<your-mongodb-connection-string>
```

---

## Development (Local)

### Backend AI Service

```bash
cd backend/ai
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Frontend

```bash
cd frontend/web
npm install
npm run dev
```

Access the app at `http://localhost:3000`

---

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build all services
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `web` | 3000 | Next.js frontend |
| `ai` | 8001 | FastAPI AI inference |

### Build Individual Images

```bash
# Build backend
docker build -f docker/ai.Dockerfile -t olym-pose-ai .

# Build frontend
docker build -f docker/web.Dockerfile -t olym-pose-web .
```

### Run Individual Containers

```bash
# Run AI service
docker run -d -p 8001:8001 --name olym-pose-ai olym-pose-ai

# Run frontend (requires AI service)
docker run -d -p 3000:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET=your-secret \
  -e GOOGLE_CLIENT_ID=your-client-id \
  -e GOOGLE_CLIENT_SECRET=your-client-secret \
  -e MONGODB_URI=your-mongodb-uri \
  -e NEXT_PUBLIC_AI_SERVICE_URL=http://host.docker.internal:8001 \
  --name olym-pose-web olym-pose-web
```

---

## CI/CD Pipeline

### GitHub Actions

The CI pipeline (`.github/workflows/ci.yml`) runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Pipeline Jobs

1. **Lint Frontend**: Runs ESLint on Next.js code
2. **Build Backend**: Builds AI service Docker image
3. **Build Frontend**: Builds Next.js Docker image
4. **Validate Compose**: Validates docker-compose.yml syntax

### Pipeline Status

All jobs must pass before merging PRs. Build caching is enabled for faster subsequent builds.

---

## Production Deployment

### Server Requirements

- 2+ CPU cores
- 4GB+ RAM
- Docker & Docker Compose installed
- Domain with SSL certificate (recommended)

### Deployment Steps

1. **Clone repository on server:**

```bash
git clone https://github.com/your-username/olym-pose-app.git
cd olym-pose-app
```

2. **Create production environment file:**

```bash
cp .env.example .env
nano .env  # Edit with production values
```

3. **Build and start services:**

```bash
docker compose build
docker compose up -d
```

4. **Set up reverse proxy (nginx):**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/ai/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

5. **Enable SSL with Certbot:**

```bash
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | Yes | Full URL of the application |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth session encryption |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXT_PUBLIC_AI_SERVICE_URL` | No | AI service URL (default: http://ai:8001 in Docker) |
| `CORS_ORIGINS` | No | Comma-separated CORS origins for AI service |

---

## Project Structure

```
olym-pose-app/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── backend/
│   └── ai/
│       ├── app/                # FastAPI application
│       ├── models/             # ML models (XGBoost, RF)
│       └── requirements.txt    # Python dependencies
├── docker/
│   ├── ai.Dockerfile           # Backend Docker image
│   └── web.Dockerfile          # Frontend Docker image
├── frontend/
│   └── web/                    # Next.js application
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment template
└── README.md                   # This file
```

---

## Troubleshooting

### Docker Build Fails

```bash
# Clean Docker cache
docker builder prune -a

# Rebuild without cache
docker compose build --no-cache
```

### MongoDB Connection Timeout

1. Check MongoDB Atlas Network Access settings
2. Add your server IP to the whitelist
3. Or enable "Allow Access from Anywhere" (not recommended for production)

### AI Service Unhealthy

```bash
# Check AI service logs
docker compose logs ai

# Restart AI service
docker compose restart ai
```

---

## License

MIT
