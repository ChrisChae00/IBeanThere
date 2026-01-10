"""
Fraud Detection Utilities

Provides location-based fraud detection for GPS spoofing prevention.
Option A: Log-only mode (no blocking, just logging for review)
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from math import radians, cos, sin, asin, sqrt
from supabase import Client
import json


def calculate_distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in meters using Haversine formula."""
    lon1, lat1_r, lon2, lat2_r = map(radians, [lng1, lat1, lng2, lat2])
    dlon = lon2 - lon1
    dlat = lat2_r - lat1_r
    a = sin(dlat/2)**2 + cos(lat1_r) * cos(lat2_r) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return c * 6371000  # Earth radius in meters


def calculate_speed_kmh(distance_meters: float, time_seconds: float) -> float:
    """Calculate speed in km/h."""
    if time_seconds <= 0:
        return float('inf')
    return (distance_meters / 1000) / (time_seconds / 3600)


def determine_severity(speed_kmh: float) -> str:
    """Determine severity based on calculated speed."""
    if speed_kmh > 1000:  # Over 1000 km/h - definitely spoofing
        return "high"
    elif speed_kmh > 200:  # Over 200 km/h - suspicious (faster than car)
        return "medium"
    elif speed_kmh > 100:  # Over 100 km/h - potentially suspicious
        return "low"
    return "none"  # Normal speed


def log_suspicious_activity(
    supabase: Client,
    user_id: str,
    action_type: str,
    current_lat: float,
    current_lng: float,
    previous_lat: Optional[float] = None,
    previous_lng: Optional[float] = None,
    previous_time: Optional[datetime] = None,
    details: Optional[Dict[str, Any]] = None,
    reason: Optional[str] = None
) -> bool:
    """
    Log suspicious location-based activity.
    
    Args:
        supabase: Supabase client
        user_id: User's ID
        action_type: Type of action (drop_bean, cafe_register, visit_log)
        current_lat: Current latitude
        current_lng: Current longitude
        previous_lat: Previous latitude (if available)
        previous_lng: Previous longitude (if available)
        previous_time: Previous action time (if available)
        details: Additional details as JSON
        reason: Human-readable reason for logging
        
    Returns:
        bool: True if logged successfully
    """
    try:
        distance_meters = None
        time_delta_seconds = None
        speed_kmh = None
        severity = "low"
        
        # Calculate distance and speed if previous location available
        if previous_lat and previous_lng:
            distance_meters = int(calculate_distance_meters(
                current_lat, current_lng, previous_lat, previous_lng
            ))
            
            if previous_time:
                now = datetime.now(timezone.utc)
                time_delta = now - previous_time
                time_delta_seconds = int(time_delta.total_seconds())
                
                if time_delta_seconds > 0:
                    speed_kmh = calculate_speed_kmh(distance_meters, time_delta_seconds)
                    severity = determine_severity(speed_kmh)
        
        # Don't log if severity is "none" (normal activity)
        if severity == "none":
            return False
        
        log_record = {
            "user_id": user_id,
            "action_type": action_type,
            "current_lat": current_lat,
            "current_lng": current_lng,
            "previous_lat": previous_lat,
            "previous_lng": previous_lng,
            "distance_meters": distance_meters,
            "time_delta_seconds": time_delta_seconds,
            "speed_kmh": round(speed_kmh, 2) if speed_kmh else None,
            "severity": severity,
            "reason": reason or f"Unusual speed detected: {speed_kmh:.0f} km/h" if speed_kmh else None,
            "details": json.dumps(details) if details else None
        }
        
        supabase.table("fraud_logs").insert(log_record).execute()
        print(f"[FRAUD LOG] {severity.upper()}: User {user_id} - {reason or 'Speed anomaly'}")
        return True
        
    except Exception as e:
        # Log error but don't fail the main operation
        print(f"[FRAUD LOG ERROR] Failed to log suspicious activity: {e}")
        return False


def get_last_drop_location(supabase: Client, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get user's last drop location and time.
    
    Returns dict with lat, lng, timestamp or None if no previous drops.
    """
    try:
        result = supabase.table("cafe_beans").select(
            "id, cafe_id, last_dropped_at"
        ).eq(
            "user_id", user_id
        ).order(
            "last_dropped_at", desc=True
        ).limit(1).execute()
        
        if not result.data:
            return None
            
        bean = result.data[0]
        
        # Get cafe location
        cafe_result = supabase.table("cafes").select(
            "latitude, longitude"
        ).eq(
            "id", bean["cafe_id"]
        ).single().execute()
        
        if not cafe_result.data:
            return None
            
        from dateutil import parser as date_parser
        
        return {
            "lat": float(cafe_result.data["latitude"]),
            "lng": float(cafe_result.data["longitude"]),
            "timestamp": date_parser.parse(bean["last_dropped_at"])
        }
        
    except Exception as e:
        print(f"[FRAUD] Error getting last drop location: {e}")
        return None


def check_location_consistency(
    supabase: Client,
    user_id: str,
    current_lat: float,
    current_lng: float,
    action_type: str = "drop_bean"
) -> bool:
    """
    Check if current location is consistent with previous activity.
    
    Logs suspicious activity if speed exceeds threshold.
    Option A: Always returns True (log only, don't block).
    
    Returns True (always) - blocking disabled in Option A mode.
    """
    last_location = get_last_drop_location(supabase, user_id)
    
    if last_location:
        log_suspicious_activity(
            supabase=supabase,
            user_id=user_id,
            action_type=action_type,
            current_lat=current_lat,
            current_lng=current_lng,
            previous_lat=last_location["lat"],
            previous_lng=last_location["lng"],
            previous_time=last_location["timestamp"]
        )
    
    # Option A: Always return True (don't block, just log)
    return True
