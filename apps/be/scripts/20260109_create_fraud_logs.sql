-- =====================================================
-- Fraud Logs Table for GPS Spoofing Detection
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create fraud_logs table
CREATE TABLE IF NOT EXISTS fraud_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('drop_bean', 'cafe_register', 'visit_log')),
    
    -- Location data
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    previous_lat DECIMAL(10, 8),
    previous_lng DECIMAL(11, 8),
    
    -- Calculated values
    distance_meters INTEGER,
    time_delta_seconds INTEGER,
    speed_kmh DECIMAL(10, 2),
    
    -- Metadata
    details JSONB DEFAULT '{}',
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'low',
    reason TEXT,
    
    -- Status
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_fraud_logs_user_id ON fraud_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_severity ON fraud_logs(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_reviewed ON fraud_logs(reviewed);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_created_at ON fraud_logs(created_at DESC);

-- RLS Policies
ALTER TABLE fraud_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read fraud logs
CREATE POLICY "Admins can read fraud logs" ON fraud_logs
    FOR SELECT
    USING (
        (SELECT auth.jwt() ->> 'role') = 'admin'
    );

-- System (service role) can insert
CREATE POLICY "Service role can insert fraud logs" ON fraud_logs
    FOR INSERT
    WITH CHECK (true);

-- Comment
COMMENT ON TABLE fraud_logs IS 'Logs suspicious location-based activity for GPS spoofing detection';
