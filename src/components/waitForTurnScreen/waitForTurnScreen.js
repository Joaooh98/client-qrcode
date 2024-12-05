import React from 'react';
import { useLocation } from 'react-router-dom';
import './waitForTurnScreen.css';

const WaitForTurnScreen = () => {
  const location = useLocation();
  const password = location.state?.senha || 'Não disponível';

  return (
    <div className="wait-container">
      <h1 className="wait-title">AGUARDE A SUA VEZ</h1>
      <div className="password-container">
        <p className="password-text">
          {password ? `SENHA: ${password}` : 'Carregando...'}
        </p>
      </div>
    </div>
  );
};

export default WaitForTurnScreen;
