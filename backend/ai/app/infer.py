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
        
        with open(MODELS_DIR / "feature_metadata.json") as f:
            meta = json.load(f)
        self.feature_cols = meta.get("enhanced_feature_columns", [])
        
        self.label_encoder = joblib.load(MODELS_DIR / "label_encoder.pkl")
        
        for name in ["xgb_enhanced.pkl", "rf_enhanced.pkl", "rf_baseline.pkl"]:
            path = MODELS_DIR / name
            if path.exists():
                self.model = joblib.load(path)
                break
        
        if self.model is None:
            raise RuntimeError("No model found")
        
        self._loaded = True
    
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
