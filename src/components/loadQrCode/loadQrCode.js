import React, { useEffect, useState } from 'react';
import { fetchQrCode } from '../../utils/fetchPassword';
import './loadQrCode.css'; 

const LoadQrCode = () => {
  const [qrCodeSvg, setQrCodeSvg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQrCode = async () => {
      try {
        const svg = await fetchQrCode();
        setQrCodeSvg(svg);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar o QR Code.');
      }
    };

    loadQrCode();
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="container">
      {qrCodeSvg ? (
        <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
      ) : (
        <p>Carregando QR Code...</p>
      )}
    </div>
  );
};

export default LoadQrCode;
