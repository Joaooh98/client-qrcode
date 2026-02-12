-- Seed: cria tenant padrão se não existir
INSERT INTO tenants (token, business_name, instagram_url, google_review_url, logo_url, background_url, current_password, current_serving, session_timeout_minutes, active, created_at, updated_at)
SELECT 'e8aaf53b-a549-423c-8349-f189f03d0b5c', 'MR Barbearia', 'https://www.instagram.com/mrbarbearia_coimbra', 'https://www.google.com/search?q=MR+Barbearia+Cr%C3%ADticas', '/logo.png', '/back-mrqrcode.png', 0, 0, 40, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE token = 'e8aaf53b-a549-423c-8349-f189f03d0b5c');
