-- Tenant padrão: MR Barbearia
INSERT INTO tenants (id, token, business_name, instagram_url, google_review_url, logo_url, background_url, current_password, current_serving, session_timeout_minutes, active, created_at, updated_at)
VALUES (1, 'e8aaf53b-a549-423c-8349-f189f03d0b5c', 'MR Barbearia', 'https://www.instagram.com/mrbarbearia_coimbra', 'https://www.google.com/search?q=MR+Barbearia+Cr%C3%ADticas', '/logo.png', '/back-mrqrcode.png', 0, 0, 40, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Tenant de exemplo para testes multi-tenant
INSERT INTO tenants (id, token, business_name, instagram_url, google_review_url, logo_url, background_url, current_password, current_serving, session_timeout_minutes, active, created_at, updated_at)
VALUES (2, 'demo-tenant-test-001', 'Barbearia Demo', 'https://www.instagram.com/demo', 'https://www.google.com/search?q=Demo+Barbearia', '/logo.png', '/back-mrqrcode.png', 0, 0, 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER SEQUENCE tenants_id_seq RESTART WITH 3;
