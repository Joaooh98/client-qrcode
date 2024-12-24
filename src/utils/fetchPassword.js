const BASE_URL = "http://147.79.101.18:8080/password";

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

  return response.text(); // Certifique-se de que o front-end está lidando com um SVG como texto.
};

