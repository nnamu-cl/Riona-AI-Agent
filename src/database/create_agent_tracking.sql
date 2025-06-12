-- Create agent_tracking table for tracking agent activities
-- This should be run in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS agent_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES template_agents(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'stopped', -- active, stopped, error
  activity_log JSONB DEFAULT '[]'::jsonb,
  total_actions INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NULL,
  stopped_at TIMESTAMP WITH TIME ZONE NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Insert a test record (optional - you can remove this)
-- Make sure to replace the agent_id with an actual UUID from your template_agents table
/*
INSERT INTO agent_tracking (agent_id, status) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'stopped')
ON CONFLICT DO NOTHING;
*/

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON agent_tracking TO authenticated;
-- GRANT ALL ON agent_tracking TO service_role;