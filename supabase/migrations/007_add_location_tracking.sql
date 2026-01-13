-- Add location fields to devices table
ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION;

-- Add index for location queries
CREATE INDEX IF NOT EXISTS idx_devices_location ON public.devices(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add index for location update queries
CREATE INDEX IF NOT EXISTS idx_devices_last_location_update ON public.devices(last_location_update DESC)
WHERE last_location_update IS NOT NULL;
