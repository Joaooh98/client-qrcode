const BASE_URL = process.env.REACT_APP_API_URL || "https://www.mrqrcode.site/password";
const API_ROOT = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/password', '')
  : "https://www.mrqrcode.site";

// ========================
// Password / Queue
// ========================

export const fetchTakePasswordForClient = async (token) => {
  if (!token) throw new Error('Token é obrigatório');
  const response = await fetch(`${BASE_URL}/take?token=${encodeURIComponent(token)}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Erro ao tirar a senha para o cliente');
  return response.json();
};

export const fetchQrCode = async (token) => {
  if (!token) throw new Error("Token é obrigatório");
  const response = await fetch(`${BASE_URL}/qrcode?token=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error("Erro ao obter o QR Code");
  return response.text();
};

export const fetchQueueStatus = async (token) => {
  if (!token) throw new Error("Token é obrigatório");
  const response = await fetch(`${BASE_URL}/queue?token=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error("Erro ao consultar a fila");
  return response.json();
};

export const fetchCallNext = async (token, jwt) => {
  if (!token) throw new Error("Token é obrigatório");
  const response = await fetch(`${BASE_URL}/call-next?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: authHeaders(jwt),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao chamar próxima senha");
  }
  return response.json();
};

export const fetchResetQueue = async (token, jwt) => {
  if (!token) throw new Error("Token é obrigatório");
  const response = await fetch(`${BASE_URL}/reset?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: authHeaders(jwt),
  });
  if (!response.ok) throw new Error("Erro ao resetar a fila");
  return response.json();
};

// ========================
// Tenant
// ========================

export const fetchTenantInfo = async (token) => {
  if (!token) throw new Error("Token é obrigatório");
  const response = await fetch(`${API_ROOT}/tenants/${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error("Estabelecimento não encontrado");
  return response.json();
};

export const fetchUpdateTenant = async (token, data, jwt) => {
  if (!token) throw new Error("Token é obrigatório");
  const response = await fetch(`${API_ROOT}/tenants/${encodeURIComponent(token)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(jwt) },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Erro ao atualizar estabelecimento");
  return response.json();
};

// ========================
// Auth
// ========================

export const fetchLogin = async (email, password) => {
  const response = await fetch(`${API_ROOT}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Email ou senha incorretos");
  }
  return response.json();
};

export const fetchRegister = async (data) => {
  const response = await fetch(`${API_ROOT}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao cadastrar");
  }
  return response.json();
};

export const fetchMe = async (jwt) => {
  const response = await fetch(`${API_ROOT}/auth/me`, {
    headers: authHeaders(jwt),
  });
  if (!response.ok) throw new Error("Sessão expirada");
  return response.json();
};

// ========================
// Helpers
// ========================

function authHeaders(jwt) {
  return jwt ? { 'Authorization': `Bearer ${jwt}` } : {};
}
