-- Add password reset token columns to profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMP WITH TIME ZONE;