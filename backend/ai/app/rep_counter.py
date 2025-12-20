"""Repetition counter with smoothing."""

from typing import Dict, List
from collections import deque
import numpy as np


# Thresholds: (down_angle, up_angle)
# down_angle: angle must go BELOW this to count as "down" phase
# up_angle: angle must go ABOVE this to count as "up" phase and complete rep
THRESHOLDS = {
    'bicep_curls': (60, 140),      # Elbow angle: bent (60) to extended (140)
    'pushups': (90, 160),           # Elbow angle during pushup
    'tricep_extensions': (60, 150),
    'squats': (90, 160),            # Knee angle: bent (90) to standing (160)
    'lunges': (90, 160),
    'situps': (40, 130),
    'jumping_jacks': (40, 140),
    'dumbbell_rows': (60, 150),
    'dumbbell_shoulder_press': (60, 160),
    'lateral_shoulder_raises': (60, 150),
}

# Smoothing window size
SMOOTHING_WINDOW = 5


class RepCounter:
    def __init__(self):
        self.count = 0
        self.phase = 'up'  # Start in "up" (extended) position
        self.angle_history: deque = deque(maxlen=SMOOTHING_WINDOW)
        self.last_valid_angle = None
        self.frames_in_phase = 0  # Debounce: require multiple frames in phase
        self.min_frames_for_transition = 3  # Require 3 consecutive frames to transition
    
    def _smooth_angle(self, angle: float) -> float:
        """Apply moving average smoothing to angle."""
        if np.isnan(angle):
            return self.last_valid_angle if self.last_valid_angle else np.nan
        
        self.angle_history.append(angle)
        self.last_valid_angle = angle
        
        if len(self.angle_history) < 2:
            return angle
        
        return float(np.mean(self.angle_history))
    
    def update(self, angle: float, down_thresh: float, up_thresh: float) -> int:
        smoothed = self._smooth_angle(angle)
        
        if np.isnan(smoothed):
            return self.count
        
        # State machine for rep counting with debouncing
        if self.phase == 'up':
            if smoothed < down_thresh:
                self.frames_in_phase += 1
                if self.frames_in_phase >= self.min_frames_for_transition:
                    self.phase = 'down'
                    self.frames_in_phase = 0
            else:
                self.frames_in_phase = 0
        elif self.phase == 'down':
            if smoothed > up_thresh:
                self.frames_in_phase += 1
                if self.frames_in_phase >= self.min_frames_for_transition:
                    self.phase = 'up'
                    self.count += 1
                    self.frames_in_phase = 0
            else:
                self.frames_in_phase = 0
        
        return self.count
    
    def reset(self):
        self.count = 0
        self.phase = 'up'
        self.angle_history.clear()
        self.last_valid_angle = None
        self.frames_in_phase = 0


class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, Dict[str, RepCounter]] = {}
    
    def get_counter(self, session_id: str, exercise: str) -> RepCounter:
        if session_id not in self._sessions:
            self._sessions[session_id] = {}
        if exercise not in self._sessions[session_id]:
            self._sessions[session_id][exercise] = RepCounter()
        return self._sessions[session_id][exercise]
    
    def update(self, session_id: str, exercise: str, angle: float) -> int:
        down, up = THRESHOLDS.get(exercise, (55, 160))
        return self.get_counter(session_id, exercise).update(angle, down, up)
    
    def get_count(self, session_id: str, exercise: str) -> int:
        if session_id in self._sessions and exercise in self._sessions[session_id]:
            return self._sessions[session_id][exercise].count
        return 0
    
    def reset(self, session_id: str):
        if session_id in self._sessions:
            del self._sessions[session_id]


sessions = SessionManager()
