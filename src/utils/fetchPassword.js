const BASE_URL = process.env.REACT_APP_API_URL || "https://www.mrqrcode.site/password";

export const fetchTakePasswordForClient = async (token) => {
  if (!token) {
    throw new Error('Token é obrigatório');
  }

  const response = await fetch(`${BASE_URL}/take?token=${encodeURIComponent(token)}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Erro ao tirar a senha para o cliente');
  }

  return response.json();
};

export const fetchQrCode = async (token) => {
  if (!token) {
    throw new Error("Token é obrigatório");
  }

  const response = await fetch(`${BASE_URL}/qrcode?token=${encodeURIComponent(token)}`);

  if (!response.ok) {
    throw new Error("Erro ao obter o QR Code");
  }

  return response.text();
};

export const fetchTenantInfo = async (token) => {
  if (!token) {
    throw new Error("Token é obrigatório");
  }

  const baseApiUrl = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/password', '')
    : "https://www.mrqrcode.site";

  const response = await fetch(`${baseApiUrl}/tenants/${encodeURIComponent(token)}`);

  if (!response.ok) {
    throw new Error("Estabelecimento não encontrado");
  }

  return response.json();
};

export const fetchQueueStatus = async (token) => {
  if (!token) {
    throw new Error("Token é obrigatório");
  }

  const response = await fetch(`${BASE_URL}/queue?token=${encodeURIComponent(token)}`);

  if (!response.ok) {
    throw new Error("Erro ao consultar a fila");
  }

  return response.json();
};
