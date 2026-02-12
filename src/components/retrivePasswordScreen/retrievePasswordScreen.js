import React, { useState, useCallback, useRef, useEffect } from 'react';
import { fetchTakePasswordForClient } from '../../utils/fetchPassword';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './retrievePasswordScreen.css';

const translations = {
  pt: { buttonText: 'Tirar Senha', loading: 'Processando...', error: 'Erro ao tirar a senha. Tente novamente.' },
  en: { buttonText: 'Take Password', loading: 'Processing...', error: 'Error taking password. Please try again.' },
};

const RetrievePasswordScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId } = useParams();
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('pt');
  const autoTriggered = useRef(false);

  const token = tenantId || 'e8aaf53b-a549-423c-8349-f189f03d0b5c';
  const t = translations[lang];

  const handleTakePassword = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchTakePasswordForClient(token);
      const senha = response.password;

      localStorage.setItem('waitForTurnAccessTime', Date.now().toString());
      localStorage.setItem('currentTenant', token);

      const basePath = tenantId ? `/${tenantId}` : '';
      navigate(`${basePath}/wait-for-turn`, { state: { senha } });
    } catch (error) {
      console.error('Erro ao adquirir a senha:', error.message);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  }, [navigate, token, tenantId, t.error]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('autoTrigger') === 'true' && !autoTriggered.current) {
      autoTriggered.current = true;
      handleTakePassword();
    }
  }, [location, handleTakePassword]);

  return (
    <div className="retrieve-password-container">
      <div
        className="background-animation"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/back-mrqrcode.png)` }}
      />

      <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="logo" />

      <div className="language-buttons">
        <button
          className="language-button-pt"
          onClick={() => setLang('pt')}
          aria-label="Alterar para português"
        >
          PT
        </button>
        <button
          className="language-button-en"
          onClick={() => setLang('en')}
          aria-label="Change to English"
        >
          EN
        </button>
      </div>

      <button
        className="retrieve-password-button"
        onClick={handleTakePassword}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading-spinner" />
            {t.loading}
          </>
        ) : (
          t.buttonText
        )}
      </button>
    </div>
  );
};

export default RetrievePasswordScreen;
