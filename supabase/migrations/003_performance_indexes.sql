-- Additional performance indexes for scaling to hundreds of users
-- These indexes optimize common query patterns

-- Composite index for common device queries (user + active status)
CREATE INDEX IF NOT EXISTS idx_devices_user_active 
  ON public.devices(user_id, is_active) 
  WHERE is_active = true;

-- Index for recent alerts (common query pattern)
CREATE INDEX IF NOT EXISTS idx_alerts_user_recent 
  ON public.alerts(user_id, created_at DESC);

-- Index for device alerts lookup
CREATE INDEX IF NOT EXISTS idx_alerts_device_created 
  ON public.alerts(device_id, created_at DESC);

-- Full text search index for device names (if you want search functionality)
CREATE INDEX IF NOT EXISTS idx_devices_name_search 
  ON public.devices USING gin(to_tsvector('english', name));

-- Partial index for active devices only (saves space)
CREATE INDEX IF NOT EXISTS idx_devices_active_only 
  ON public.devices(user_id, created_at DESC) 
  WHERE is_active = true;


