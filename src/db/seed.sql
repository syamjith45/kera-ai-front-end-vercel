
-- Seed data for parking_lots
INSERT INTO parking_lots (id, name, address, description, image_url, latitude, longitude, hourly_rate, total_spots, available_spots, created_at, slots)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Central Plaza Garage',
    '123 Main St, Downtown',
    'Secure underground parking in the heart of the city.',
    'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=2000&auto=format&fit=crop',
    40.7128,
    -74.0060,
    5.00,
    100,
    15,
    NOW(),
    '[
      {"id": "A1", "isBooked": false},
      {"id": "A2", "isBooked": true},
      {"id": "A3", "isBooked": false}
    ]'::jsonb
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Westside Structure',
    '456 West Ave, Westside',
    'Convenient parking near the shopping district.',
    'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=1974&auto=format&fit=crop',
    40.7300,
    -74.0100,
    4.50,
    80,
    20,
    NOW(),
    '[
      {"id": "B1", "isBooked": false},
      {"id": "B2", "isBooked": false}
    ]'::jsonb
  ),
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'Airport Long-Term',
    '789 Airport Blvd',
    'Affordable long-term parking with shuttle service.',
    'https://images.unsplash.com/photo-1590674899505-1c5c41951f89?q=80&w=2000&auto=format&fit=crop',
    40.6413,
    -73.7781,
    2.00,
    500,
    120,
    NOW(),
    '[]'::jsonb
  );

-- Dummy profile (Note: In production, profiles are linked to auth.users. This is just for initial table structure verification if needed)
-- INSERT INTO profiles (id, email, full_name, vehicle_make, vehicle_model, vehicle_plate, phone_number, created_at, updated_at)
-- VALUES (
--   'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', -- This UUID must match a real user ID in auth.users
--   'testuser@example.com',
--   'Test User',
--   'Toyota',
--   'Camry',
--   'ABC-1234',
--   '+1234567890',
--   NOW(),
--   NOW()
-- );
