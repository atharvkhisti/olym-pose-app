"""Model loading and inference."""

import json
import os
from pathlib import Path
from typing import List, Optional, Tuple

import joblib
import numpy as np

from .schemas import Landmark
from .preprocess import extract_features, get_primary_angle, features_to_vector
from .rep_counter import sessions

MODELS_DIR = Path(os.environ.get("MODELS_DIR", Path(__file__).parent.parent / "models"))


class Classifier:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.feature_cols: List[str] = []
        self._loaded = False
    
    def load(self):
        if self._loaded:
            return
        
        try:
            with open(MODELS_DIR / "feature_metadata.json") as f:
                meta = json.load(f)
            self.feature_cols = meta.get("enhanced_feature_columns", [])
            
            # Try loading with different pickle protocols/compatibility
            try:
                self.label_encoder = joblib.load(MODELS_DIR / "label_encoder.pkl")
            except (KeyError, ValueError, TypeError) as e:
                # Pickle compatibility issue - try with encoding='latin1' for Python 2/3 compatibility
                import warnings
                warnings.filterwarnings('ignore', category=UserWarning)
                try:
                    self.label_encoder = joblib.load(MODELS_DIR / "label_encoder.pkl", encoding='latin1')
                except Exception:
                    # If still fails, try with pickle protocol 4
                    import pickle
                    with open(MODELS_DIR / "label_encoder.pkl", 'rb') as f:
                        self.label_encoder = pickle.load(f, encoding='latin1')
            
            for name in ["xgb_enhanced.pkl", "rf_enhanced.pkl", "rf_baseline.pkl"]:
                path = MODELS_DIR / name
                if path.exists():
                    try:
                        self.model = joblib.load(path)
                    except (KeyError, ValueError, TypeError):
                        # Try with encoding='latin1' for compatibility
                        try:
                            self.model = joblib.load(path, encoding='latin1')
                        except Exception:
                            import pickle
                            with open(path, 'rb') as f:
                                self.model = pickle.load(f, encoding='latin1')
                    break
            
            if self.model is None:
                raise RuntimeError("No model found")
            
            self._loaded = True
        except Exception as e:
            # Log error but don't crash - allow health endpoint to work
            import logging
            logging.error(f"Failed to load models: {e}")
            self._loaded = False
            raise
    
    @property
    def is_loaded(self) -> bool:
        return self._loaded
    
    def predict(self, landmarks: List[Landmark], session_id: str, exercise: Optional[str] = None) -> Tuple[str, float, int]:
        feats = extract_features(landmarks)
        X = np.array([features_to_vector(feats, self.feature_cols)])
        
        probs = self.model.predict_proba(X)[0]
        classes = self.label_encoder.classes_
        
        # If user selected an exercise, use that and get its confidence
        if exercise:
            target = exercise
            # Get confidence for the selected exercise
            if exercise in classes:
                exercise_idx = list(classes).index(exercise)
                confidence = float(probs[exercise_idx])
            else:
                # Fallback: use max confidence if exercise not in model classes
                confidence = float(np.max(probs))
        else:
            # Auto-detect mode: use predicted exercise
            idx = int(np.argmax(probs))
            target = self.label_encoder.inverse_transform([idx])[0]
            confidence = float(probs[idx])
        
        # Get angle for rep counting
        angle = get_primary_angle(landmarks, target)
        rep_count = sessions.update(session_id, target, angle)
        
        # Return the target exercise (user's selection or prediction), not always prediction
        return target, confidence, rep_count


classifier = Classifier()
