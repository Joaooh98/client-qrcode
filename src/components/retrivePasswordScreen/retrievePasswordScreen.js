import React, { useState, useCallback, useRef, useEffect } from 'react';
import { fetchTakePasswordForClient } from '../../utils/fetchPassword';
import { useNavigate, useLocation } from 'react-router-dom';
import './retrievePasswordScreen.css';

const RetrievePasswordScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Tirar Senha'); // Texto do botão padrão em PT
  const autoTriggered = useRef(false);

  const token = 'e8aaf53b-a549-423c-8349-f189f03d0b5c';

  const handleTakePassword = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchTakePasswordForClient(token);
      const senha = response.password;

      // Salva o horário de acesso no Local Storage
      localStorage.setItem('waitForTurnAccessTime', Date.now().toString());

      navigate('/wait-for-turn', { state: { senha } });
    } catch (error) {
      console.error('Erro ao adquirir a senha:', error.message);
      alert('Erro ao tirar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  // Funções para alterar o idioma
  const changeToPortuguese = () => setButtonText('Tirar Senha');
  const changeToEnglish = () => setButtonText('Take Password');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('autoTrigger') === 'true' && !autoTriggered.current) {
      autoTriggered.current = true;
      handleTakePassword();
    }
  }, [location, handleTakePassword]);

  return (
    <div className="retrieve-password-container">
      <div className="background-animation"></div>

      {/* Logo */}
      <img src="/logo.png" alt="MR Barbearia Logo" className="logo" />
      {/* Botões de tradução */}
      <div className="language-buttons">
        <button
          className="language-button-pt"
          onClick={changeToPortuguese}
          aria-label="Alterar para português"
        >
          PT
        </button>
        <button
          className="language-button-en"
          onClick={changeToEnglish}
          aria-label="Change to English"
        >
          EN
        </button>
      </div>

      {/* Botão para tirar senha */}
      <button
        className="retrieve-password-button"
        onClick={handleTakePassword}
        disabled={loading}
      >
        {loading ? 'Processando...' : buttonText}
      </button>
    </div>
  );
};

export default RetrievePasswordScreen;
