# Model Regeneration Scripts

## regenerate_models.py

Regenerates pickle files with Python 3.11 compatible format.

### Prerequisites

1. Python 3.11 installed
2. Install dependencies:
   ```bash
   cd backend/ai
   pip install -r requirements.txt
   ```

### Usage

```bash
cd backend/ai
python scripts/regenerate_models.py
```

### What it does

1. Loads existing pickle files (if compatible)
2. Re-saves them using `joblib.dump` with protocol 4 (Python 3.4+ compatible)
3. Ensures all files are compatible with Python 3.11

### If regeneration fails

If the script cannot load existing models due to incompatibility:

1. **Option A: Retrain models** (if you have training data/script)
   - Use Python 3.11 with pinned versions from `requirements.txt`
   - Train models and save with `joblib.dump(model, path, protocol=4)`

2. **Option B: Use compatible Python version**
   - Install Python version that matches original training environment
   - Load models and re-save with Python 3.11

### Verification

After regeneration, verify models load:

```bash
python -c "from app.infer import classifier; classifier.load(); print('Models loaded:', classifier.is_loaded)"
```

