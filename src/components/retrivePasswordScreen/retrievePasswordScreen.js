import React, { useState } from 'react';
import './retrievePasswordScreen.css';
import LoadQrCode from '../loadQrCode/loadQrCode';
import { fetchTakePasswordForClient } from '../../utils/fetchPassword'; 
import { useNavigate } from 'react-router-dom';

const RetrievePasswordScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleTakePassword = async () => {
    try {
      setLoading(true);
      const senha = await fetchTakePasswordForClient();
      navigate('/wait-for-turn', { state: { senha } }); // Passa a senha como estado
    } catch (error) {
      console.error('Erro ao adquirir a senha:', error.message);
      alert('Erro ao tirar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
