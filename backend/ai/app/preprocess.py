"""Landmark preprocessing."""

from typing import Dict, List
import numpy as np

from .schemas import Landmark

IDX = {
    'nose': 0,
    'left_shoulder': 11, 'right_shoulder': 12,
    'left_elbow': 13, 'right_elbow': 14,
    'left_wrist': 15, 'right_wrist': 16,
    'left_hip': 23, 'right_hip': 24,
    'left_knee': 25, 'right_knee': 26,
    'left_ankle': 27, 'right_ankle': 28,
}

ANGLES = {
    'l_elbow': ('left_shoulder', 'left_elbow', 'left_wrist'),
    'r_elbow': ('right_shoulder', 'right_elbow', 'right_wrist'),
    'l_knee': ('left_hip', 'left_knee', 'left_ankle'),
    'r_knee': ('right_hip', 'right_knee', 'right_ankle'),
    'l_hip': ('left_shoulder', 'left_hip', 'left_knee'),
    'r_hip': ('right_shoulder', 'right_hip', 'right_knee'),
}


def _angle(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    v1, v2 = a - b, c - b
    n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
    if n1 < 1e-6 or n2 < 1e-6:
        return np.nan
    return float(np.degrees(np.arccos(np.clip(np.dot(v1, v2) / (n1 * n2), -1, 1))))


def extract_features(landmarks: List[Landmark]) -> Dict[str, float]:
    """Extract features from 33 BlazePose landmarks."""
    pts = np.array([[lm.x, lm.y] if lm.visibility > 0.5 else [np.nan, np.nan] for lm in landmarks])
    feats = {}
    
    for name, (a, b, c) in ANGLES.items():
        feats[name] = _angle(pts[IDX[a]], pts[IDX[b]], pts[IDX[c]])
    
    # Body tilt
    nose = pts[IDX['nose']]
    lh, rh = pts[IDX['left_hip']], pts[IDX['right_hip']]
    mid_hip = (lh + rh) / 2.0
    if not (np.isnan(nose).any() or np.isnan(mid_hip).any()):
        vec = nose - mid_hip
        feats['body_tilt'] = float(np.degrees(np.arctan2(vec[1], vec[0])))
    else:
        feats['body_tilt'] = np.nan
    
    # Ratios
    def _dist(i, j):
        p1, p2 = pts[IDX[i]], pts[IDX[j]]
        if np.isnan(p1).any() or np.isnan(p2).any():
            return np.nan
        return float(np.linalg.norm(p1 - p2))
    
    sh_w = _dist('left_shoulder', 'right_shoulder')
    hip_w = _dist('left_hip', 'right_hip')
    feats['ratio_sh_hip'] = sh_w / (hip_w + 1e-6) if not (np.isnan(sh_w) or np.isnan(hip_w)) else np.nan
    
    ls = pts[IDX['left_shoulder']]
    lw = pts[IDX['left_wrist']]
    arm_len = float(np.linalg.norm(ls - lw)) if not (np.isnan(ls).any() or np.isnan(lw).any()) else np.nan
    rs = pts[IDX['right_shoulder']]
    mid_sh = (ls + rs) / 2.0 if not (np.isnan(ls).any() or np.isnan(rs).any()) else np.array([np.nan, np.nan])
    torso_len = float(np.linalg.norm(mid_sh - mid_hip)) if not np.isnan(mid_sh).any() else np.nan
    feats['ratio_arm_torso'] = arm_len / (torso_len + 1e-6) if not (np.isnan(arm_len) or np.isnan(torso_len)) else np.nan
    
    return feats


def features_to_vector(feats: Dict[str, float], feature_cols: List[str]) -> List[float]:
    """Convert feature dict to vector matching model's expected columns."""
    result = []
    for col in feature_cols:
        base = col.replace('_mean', '').replace('_std', '')
        val = feats.get(base, 0.0)
        if val is None or (isinstance(val, float) and np.isnan(val)):
            val = 0.0
        result.append(val)
    return result


def get_primary_angle(landmarks: List[Landmark], exercise: str) -> float:
    """Get primary angle for rep counting."""
    angle_map = {
        'bicep_curls': 'l_elbow', 'pushups': 'l_elbow', 'tricep_extensions': 'l_elbow',
        'squats': 'l_knee', 'lunges': 'l_knee',
        'situps': 'l_hip', 'jumping_jacks': 'l_hip',
        'dumbbell_rows': 'l_elbow', 'dumbbell_shoulder_press': 'l_elbow',
        'lateral_shoulder_raises': 'l_elbow',
    }
    feats = extract_features(landmarks)
    return feats.get(angle_map.get(exercise, 'l_elbow'), np.nan)
