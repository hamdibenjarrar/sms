-- Insert a demo admin user (password: password123)
INSERT INTO users (email, password_hash, role) VALUES (
  'admin@example.com',
  '7a5f1d7c8e2b9a4f:8c5c5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e5d5c5d5e',
  'admin'
) ON CONFLICT (email) DO NOTHING;
