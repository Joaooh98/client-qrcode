import React, { useEffect, useState, useCallback } from 'react';
import './retrievePasswordScreen.css';
import LoadQrCode from '../loadQrCode/loadQrCode';
import { fetchTakePasswordForClient } from '../../utils/fetchPassword'; 
import { useNavigate, useLocation } from 'react-router-dom';

const RetrievePasswordScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleTakePassword = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchTakePasswordForClient(); // Obtem o JSON
      const senha = response.password; // Extraia o valor da senha
      navigate('/wait-for-turn', { state: { senha } }); // Envie apenas o valor
    } catch (error) {
      console.error('Erro ao adquirir a senha:', error.message);
      alert('Erro ao tirar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('autoTrigger') === 'true') {
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
