import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackButton from '../backButton/backButton';
import { GoogleIcon } from '../icons/google-icon';
import { InstaIcon } from '../icons/insta-icon';
import './waitForTurnScreen.css';

const WaitForTurnScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const password = location.state?.senha;

  const basePath = tenantId ? `/${tenantId}` : '';

  useEffect(() => {
    const accessTime = localStorage.getItem('waitForTurnAccessTime');
    const now = Date.now();
    const timeLimit = 40 * 60 * 1000;

    if (!accessTime || now - parseInt(accessTime, 10) > timeLimit) {
      navigate(`${basePath}/`);
    }
  }, [navigate, basePath]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('waitForTurnAccessTime');
      localStorage.removeItem('currentTenant');
      navigate(`${basePath}/`);
    }, 40 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [navigate, basePath]);

  return (
    <div className="wait-container">
      <BackButton to={`${basePath}/`} />
      <div
        className="background-animation"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/back-mrqrcode.png)` }}
      />

      <section className="password-section">
        <h1 className="wait-title">AGUARDE A SUA VEZ</h1>
        <div className="password-container">
          <p className="password-text">
            {password ? `Senha: ${password}` : 'Senha não disponível'}
          </p>
        </div>
      </section>

      <section className="social-container">
        <SocialSection
          title="Siga-nos nas redes sociais"
          icon={<InstaIcon />}
          link="https://www.instagram.com/mrbarbearia_coimbra"
          label="Instagram"
        />
        <SocialSection
          title="Ajude-nos com sua avaliação"
          description="Sua opinião é muito importante! Clique no ícone abaixo para nos avaliar no Google."
          icon={<GoogleIcon />}
          link="https://www.google.com/search?q=MR+Barbearia+Cr%C3%ADticas"
          label="Google Avaliações"
        />
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
