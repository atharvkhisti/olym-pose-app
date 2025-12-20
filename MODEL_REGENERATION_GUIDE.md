# Model Regeneration Guide

This guide walks you through fixing pickle compatibility issues in the AI service.

## Problem

The AI container restarts because pickle files were created with incompatible Python/sklearn/joblib versions.

## Solution

Regenerate all pickle files using Python 3.11 with pinned library versions.

## Step-by-Step Instructions

### 1️⃣ Verify Python 3.11

```bash
python --version
# Should show: Python 3.11.x
```

If not installed:
- **Windows**: Download from python.org or use `winget install Python.Python.3.11`
- **Linux**: `sudo apt-get install python3.11 python3.11-venv`
- **Mac**: `brew install python@3.11`

### 2️⃣ Set Up Environment

```bash
cd backend/ai

# Create virtual environment
python3.11 -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install pinned dependencies
pip install -r requirements.txt gunicorn
```

### 3️⃣ Regenerate Models

```bash
# Run regeneration script
python scripts/regenerate_models.py
```

**Expected output:**
```
✓ Successfully regenerated label_encoder.pkl
✓ Successfully loaded model: xgb_enhanced.pkl
✓ Successfully regenerated xgb_enhanced.pkl
...
Regeneration complete: 4/4 files succeeded
```

**If regeneration fails:**
- The existing pickle files may be too incompatible
- You'll need to retrain models (see "Retraining Models" below)

### 4️⃣ Verify Models Load

```bash
# Test model loading
python -c "from app.infer import classifier; classifier.load(); print('Models loaded:', classifier.is_loaded)"
```

Should output: `Models loaded: True`

### 5️⃣ Test Service Locally

```bash
# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8001

# In another terminal, test health endpoint
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_status": "loaded"
}
```

### 6️⃣ Rebuild Docker Image

```bash
# From project root
docker build -f docker/ai.Dockerfile -t ghcr.io/atharvkhisti/olym-pose-ai:fixed .

# Tag as latest as well
docker tag ghcr.io/atharvkhisti/olym-pose-ai:fixed ghcr.io/atharvkhisti/olym-pose-ai:latest
```

### 7️⃣ Push to GHCR

```bash
# Authenticate
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u atharvkhisti --password-stdin

# Push both tags
docker push ghcr.io/atharvkhisti/olym-pose-ai:fixed
docker push ghcr.io/atharvkhisti/olym-pose-ai:latest
```

### 8️⃣ Update Production

On your VPS:

```bash
cd ~/olym-pose-app

# Pull latest code
git pull

# Pull new image
docker-compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml pull ai

# Restart AI service
docker-compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml up -d ai

# Check logs
docker logs olym-pose-ai

# Verify health
curl http://localhost:8001/health
```

### 9️⃣ Verify Container Stability

```bash
# Check container status (should not restart)
docker-compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml ps

# Monitor for 2-3 minutes
watch -n 5 'docker-compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml ps'
```

Container should show `Up (healthy)` and not restart.

## Retraining Models (If Regeneration Fails)

If `regenerate_models.py` cannot load existing models:

1. **Locate your training script/data**
2. **Ensure Python 3.11 environment**:
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

3. **Train and save models**:
   ```python
   import joblib
   from sklearn.preprocessing import LabelEncoder
   
   # Train your models...
   
   # Save with protocol 4 (Python 3.4+ compatible)
   joblib.dump(label_encoder, "models/label_encoder.pkl", protocol=4)
   joblib.dump(model, "models/xgb_enhanced.pkl", protocol=4)
   # etc.
   ```

4. **Verify saved models load**:
   ```python
   import joblib
   encoder = joblib.load("models/label_encoder.pkl")
   model = joblib.load("models/xgb_enhanced.pkl")
   print("Models loaded successfully!")
   ```

## Troubleshooting

### Models still fail to load

1. Check Python version matches: `python --version` should be 3.11.x
2. Verify library versions: `pip list | grep -E "scikit-learn|joblib|numpy|xgboost"`
3. Check model files exist: `ls -lh backend/ai/models/*.pkl`
4. Review logs: `docker logs olym-pose-ai`

### Container still restarting

1. Check if models actually loaded: `curl http://localhost:8001/health`
2. Review startup logs: `docker logs olym-pose-ai | grep -i "model"`
3. Verify image was rebuilt: `docker images | grep olym-pose-ai`

### Health endpoint shows `model_loaded: false`

- Models failed to load but service started (this is expected behavior)
- Check logs for specific error
- May need to retrain models if regeneration failed

## Success Criteria

✅ AI container stays running (no restarts)  
✅ `/health` returns `{"status": "healthy", "model_loaded": true}`  
✅ Frontend can successfully call AI API  
✅ No pickle errors in logs  

## Summary of Changes

1. **requirements.txt**: Pinned exact versions for deterministic builds
2. **app/infer.py**: Improved error handling and logging
3. **scripts/regenerate_models.py**: Script to regenerate pickle files
4. **app/main.py**: Health endpoint shows model loading status

All changes maintain backward compatibility and don't break existing functionality.

