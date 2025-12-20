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
        """Load models with proper error handling and logging."""
        if self._loaded:
            return
        
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.info("Starting model loading process...")
            
            # Load feature metadata
            metadata_path = MODELS_DIR / "feature_metadata.json"
            if not metadata_path.exists():
                raise FileNotFoundError(f"Feature metadata not found: {metadata_path}")
            
            with open(metadata_path) as f:
                meta = json.load(f)
            self.feature_cols = meta.get("enhanced_feature_columns", [])
            logger.info(f"Loaded feature metadata with {len(self.feature_cols)} features")
            
            # Load label encoder
            encoder_path = MODELS_DIR / "label_encoder.pkl"
            if not encoder_path.exists():
                raise FileNotFoundError(f"Label encoder not found: {encoder_path}")
            
            try:
                self.label_encoder = joblib.load(encoder_path)
                logger.info(f"Successfully loaded label encoder with classes: {list(self.label_encoder.classes_)}")
            except Exception as e:
                logger.error(f"Failed to load label encoder: {e}")
                raise RuntimeError(f"Cannot load label encoder: {e}") from e
            
            # Load model (try in priority order)
            model_loaded = False
            for name in ["xgb_enhanced.pkl", "rf_enhanced.pkl", "rf_baseline.pkl"]:
                path = MODELS_DIR / name
                if not path.exists():
                    logger.debug(f"Model file not found: {name}, skipping...")
                    continue
                
                try:
                    self.model = joblib.load(path)
                    logger.info(f"Successfully loaded model: {name} (type: {type(self.model).__name__})")
                    model_loaded = True
                    break
                except Exception as e:
                    logger.warning(f"Failed to load {name}: {e}, trying next model...")
                    continue
            
            if not model_loaded:
                raise RuntimeError("No model files could be loaded. Check model files exist and are compatible.")
            
            # Verify model and encoder are compatible
            if hasattr(self.model, 'classes_'):
                model_classes = set(self.model.classes_)
                encoder_classes = set(self.label_encoder.classes_)
                if model_classes != encoder_classes:
                    logger.warning(f"Model classes {model_classes} don't match encoder classes {encoder_classes}")
            
            self._loaded = True
            logger.info("✓ All models loaded successfully!")
            
        except Exception as e:
            # Log detailed error but don't crash - allow health endpoint to work
            logger.error("=" * 60)
            logger.error("MODEL LOADING FAILED")
            logger.error(f"Error: {e}")
            logger.error(f"Type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback:\n{traceback.format_exc()}")
            logger.error("=" * 60)
            self._loaded = False
            # Don't raise - allow service to start without models
    
    @property
    def is_loaded(self) -> bool:
        return self._loaded
    
    def predict(self, landmarks: List[Landmark], session_id: str, exercise: Optional[str] = None) -> Tuple[str, float, int]:
        if not self._loaded or self.model is None or self.label_encoder is None:
            raise RuntimeError("Model not loaded")
        
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
