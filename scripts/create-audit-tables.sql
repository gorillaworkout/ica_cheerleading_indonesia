-- Create audit logs table for tracking all user changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);

-- Create profile change requests table for admin approval workflow
CREATE TABLE IF NOT EXISTS profile_change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('PROFILE_UPDATE', 'COACH_UPDATE', 'PASSWORD_CHANGE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create indexes for change requests
CREATE INDEX IF NOT EXISTS idx_change_requests_user_id ON profile_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON profile_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_change_requests_requested_at ON profile_change_requests(requested_at);

-- RLS Policies for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
FOR SELECT USING (user_id = auth.uid());

-- Only authenticated users can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- RLS Policies for profile_change_requests
ALTER TABLE profile_change_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own change requests
CREATE POLICY "Users can view own change requests" ON profile_change_requests
FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own change requests
CREATE POLICY "Users can insert own change requests" ON profile_change_requests
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view and update all change requests
CREATE POLICY "Admins can manage all change requests" ON profile_change_requests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
