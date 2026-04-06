-- Add trader (handlowiec) user
-- Password: handlowiec123 (hashed with BCrypt)
-- Hash: $2a$10$7YItJyDZPW9wnpxpFCLrOe5z8JzQzJ.oRq8KoHmm0WjdZ8F0bDrPK

INSERT INTO profiles (id, first_name, last_name, email, role, password_hash, is_active)
VALUES (
    gen_random_uuid(),
    'Handlowiec',
    'Test',
    'handlowiec@twojadomena.pl',
    'TRADER',
    '$2a$10$7YItJyDZPW9wnpxpFCLrOe5z8JzQzJ.oRq8KoHmm0WjdZ8F0bDrPK',
    TRUE
)
ON CONFLICT (email) DO UPDATE
SET password_hash = '$2a$10$7YItJyDZPW9wnpxpFCLrOe5z8JzQzJ.oRq8KoHmm0WjdZ8F0bDrPK';
