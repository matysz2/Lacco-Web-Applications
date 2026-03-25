-- Create profiles table
-- This table stores user information and authentication details

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fcm_token TEXT,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Create test user (password: password123 - hashed with BCrypt)
-- You should change this before deployment!
INSERT INTO profiles (id, first_name, last_name, email, role, password_hash)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Test',
    'User',
    'test@example.com',
    'ADMIN',
    '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUm'
)
ON CONFLICT (email) DO NOTHING;
