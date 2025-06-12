-- Create agent_tracking table for tracking agent activities
-- This should be run in your Supabase SQL editor
-- Standalone version that doesn't depend on other tables

CREATE TABLE IF NOT EXISTS agent_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR NOT NULL, -- Using VARCHAR instead of UUID reference
  status VARCHAR DEFAULT 'stopped', -- active, stopped, error
  activity_log JSONB DEFAULT '[]'::jsonb,
  total_actions INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NULL,
  stopped_at TIMESTAMP WITH TIME ZONE NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION handle_agent_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS on_agent_tracking_updated ON agent_tracking;
CREATE TRIGGER on_agent_tracking_updated 
  BEFORE UPDATE ON agent_tracking 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_agent_tracking_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_tracking_agent_id ON agent_tracking(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tracking_status ON agent_tracking(status);
CREATE INDEX IF NOT EXISTS idx_agent_tracking_updated_at ON agent_tracking(updated_at);

-- Grant permissions for authenticated users and service role
ALTER TABLE agent_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON agent_tracking
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON agent_tracking
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON agent_tracking
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON agent_tracking
  FOR DELETE USING (true);