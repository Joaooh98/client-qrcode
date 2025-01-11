import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../backButton/backButton';
import { GoogleIcon } from '../icons/google-icon';
import { InstaIcon } from '../icons/insta-icon';
import './waitForTurnScreen.css';

const WaitForTurnScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const password = location.state?.senha || 'Não disponível';

  // Verifica autorização no Local Storage
  useEffect(() => {
    const accessTime = localStorage.getItem('waitForTurnAccessTime');
    const now = Date.now();
    const timeLimit = 40 * 60 * 1000; // 40 minutos

    if (!accessTime || now - parseInt(accessTime, 10) > timeLimit) {
      navigate('/'); // Redireciona para a home se o tempo expirou ou não há registro
    }
  }, [navigate]);

  // Define o timer para redirecionamento
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/'); // Redireciona para a rota inicial após o tempo definido
    }, 40 * 60 * 1000); // Para testes, 1 minuto em milissegundos

    return () => clearTimeout(timer); // Limpa o timer quando o componente desmontar
  }, [navigate]);

  return (
    <div className="wait-container">
      <BackButton to="/" />
      {/* Fundo Animado */}
      <div className="background-animation"></div>

      {/* Seção de Redes Sociais */}
      <section className="social-container">
        <SocialSection
          title="Siga-nos nas redes sociais"
          icon={<InstaIcon />}
          link="https://www.instagram.com/mrbarbearia_coimbra"
          label="Instagram"
        />
        <SocialSection
          title="Ajude-nos com sua avaliação"
          description="Sua opinião é muito importante! Clique no botão abaixo para nos avaliar no Google."
          icon={<GoogleIcon />}
          link="https://www.google.com/search?q=MR+Barbearia+Críticas"
          label="Google Avaliações"
        />
      </section>

      {/* Seção de Senha */}
      <section className="password-section">
        <h1 className="wait-title">AGUARDE A SUA VEZ</h1>
        <div className="password-container">
          <p className="password-text">
            {password ? `Senha: ${password}` : 'Carregando...'}
          </p>
        </div>
      </section>
    </div>
  );
};

const SocialSection = ({ title, description, icon, link, label }) => (
  <div className="social-section">
    <h2 className="social-title">{title}</h2>
    {description && <p className="google-evaluation-text">{description}</p>}
    <div className="social-icons">
      <a href={link} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {icon}
      </a>
    </div>
  </div>
);

export default WaitForTurnScreen;
