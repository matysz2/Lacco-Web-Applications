-- Update user roles from HANDLOWIEC to TRADER
-- This ensures consistency in the codebase where TRADER is the standard role name

UPDATE profiles
SET role = 'TRADER'
WHERE role = 'HANDLOWIEC';
