import React, { useEffect, useState, useCallback, useRef } from 'react';
import './retrievePasswordScreen.css';
import LoadQrCode from '../loadQrCode/loadQrCode';
import { fetchTakePasswordForClient } from '../../utils/fetchPassword'; 
import { useNavigate, useLocation } from 'react-router-dom';

const RetrievePasswordScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const autoTriggered = useRef(false); // Adiciona referência para controlar disparo único

  // Defina o token de forma segura no código
  const token = 'e8aaf53b-a549-423c-8349-f189f03d0b5c';

  const handleTakePassword = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchTakePasswordForClient(token); 
      const senha = response.password; 
      navigate('/wait-for-turn', { state: { senha } });
    } catch (error) {
      console.error('Erro ao adquirir a senha:', error.message);
      alert('Erro ao tirar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('autoTrigger') === 'true' && !autoTriggered.current) {
      autoTriggered.current = true; 
      handleTakePassword();
    }
  }, [location, handleTakePassword]);

  return (
    <div className="retrieve-password-container">
      <h1 className="retrieve-password-title">RETIRE SUA SENHA</h1>
      <LoadQrCode />
      <button 
        className="retrieve-password-button" 
        onClick={handleTakePassword}
        disabled={loading}
      >
        {loading ? 'Processando...' : 'Tirar Senha'}
      </button>
    </div>
  );
};

export default RetrievePasswordScreen;
