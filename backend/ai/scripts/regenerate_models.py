#!/usr/bin/env python3
"""
Regenerate pickle files with Python 3.11 compatible versions.

This script loads existing models and re-saves them using joblib.dump
with Python 3.11 and pinned library versions to ensure compatibility.

Usage:
    python scripts/regenerate_models.py
"""

import sys
import logging
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import joblib
import numpy as np
from sklearn.preprocessing import LabelEncoder

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent.parent / "models"


def regenerate_label_encoder():
    """Regenerate label_encoder.pkl with Python 3.11 compatible format."""
    logger.info("Regenerating label_encoder.pkl...")
    
    try:
        # Try to load existing encoder
        try:
            encoder = joblib.load(MODELS_DIR / "label_encoder.pkl")
            logger.info(f"Successfully loaded existing encoder with classes: {encoder.classes_}")
        except Exception as e:
            logger.warning(f"Could not load existing encoder: {e}")
            logger.info("Creating new LabelEncoder...")
            # Create a new encoder - you'll need to fit it with your classes
            # For now, we'll try to infer from the model files
            encoder = LabelEncoder()
            # Common exercise classes - adjust based on your actual classes
            exercise_classes = [
                "push_up", "squat", "plank", "lunges", "burpees",
                "jumping_jacks", "sit_up", "mountain_climber"
            ]
            encoder.fit(exercise_classes)
            logger.warning("Using default exercise classes. Update if different!")
        
        # Re-save with Python 3.11 compatible format
        output_path = MODELS_DIR / "label_encoder.pkl"
        joblib.dump(encoder, output_path, protocol=4)  # Protocol 4 is compatible with Python 3.4+
        logger.info(f"✓ Successfully regenerated {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"✗ Failed to regenerate label_encoder.pkl: {e}")
        return False


def regenerate_model(model_name: str):
    """Regenerate a model pickle file with Python 3.11 compatible format."""
    logger.info(f"Regenerating {model_name}...")
    
    model_path = MODELS_DIR / model_name
    if not model_path.exists():
        logger.warning(f"Model file {model_name} does not exist, skipping...")
        return False
    
    try:
        # Try to load existing model
        try:
            model = joblib.load(model_path)
            logger.info(f"Successfully loaded {model_name} (type: {type(model).__name__})")
        except Exception as e:
            logger.error(f"Could not load {model_name}: {e}")
            logger.error("Cannot regenerate - original model cannot be loaded")
            return False
        
        # Re-save with Python 3.11 compatible format
        joblib.dump(model, model_path, protocol=4)
        logger.info(f"✓ Successfully regenerated {model_path}")
        return True
        
    except Exception as e:
        logger.error(f"✗ Failed to regenerate {model_name}: {e}")
        return False


def main():
    """Main function to regenerate all model files."""
    logger.info("=" * 60)
    logger.info("Model Regeneration Script")
    logger.info("Python version: %s", sys.version)
    logger.info("=" * 60)
    
    # Check Python version
    if sys.version_info < (3, 11):
        logger.error("Python 3.11+ required. Current version: %s", sys.version)
        sys.exit(1)
    
    # Verify models directory exists
    if not MODELS_DIR.exists():
        logger.error(f"Models directory not found: {MODELS_DIR}")
        sys.exit(1)
    
    logger.info(f"Models directory: {MODELS_DIR}")
    
    # Regenerate all models
    success_count = 0
    total_count = 0
    
    # Regenerate label encoder
    total_count += 1
    if regenerate_label_encoder():
        success_count += 1
    
    # Regenerate model files
    model_files = ["xgb_enhanced.pkl", "rf_enhanced.pkl", "rf_baseline.pkl"]
    for model_file in model_files:
        total_count += 1
        if regenerate_model(model_file):
            success_count += 1
    
    # Summary
    logger.info("=" * 60)
    logger.info(f"Regeneration complete: {success_count}/{total_count} files succeeded")
    logger.info("=" * 60)
    
    if success_count == total_count:
        logger.info("✓ All models regenerated successfully!")
        return 0
    else:
        logger.warning("⚠ Some models failed to regenerate")
        logger.warning("You may need to retrain models if they cannot be loaded")
        return 1


if __name__ == "__main__":
    sys.exit(main())

