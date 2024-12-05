  export const fetchTakePasswordForClient = async () => {
    const response = await fetch("http://localhost:8080/password/take", {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error('Erro ao tirar a senha para o cliente');
    }
    return response.text(); // realiza a chamada no back-end e retorna a senha
  };

  export const fetchQrCode = async () => {
    const response = await fetch("http://localhost:8080/password/qrcode");
    if (!response.ok) {
      throw new Error('Erro ao obter o QR Code');
    }
    return response.text(); // Retorna o SVG como string
  };
  