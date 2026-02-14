import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackButton from '../backButton/backButton';
import { GoogleIcon } from '../icons/google-icon';
import { InstaIcon } from '../icons/insta-icon';
import { fetchTenantInfo } from '../../utils/fetchPassword';
import './waitForTurnScreen.css';

const WaitForTurnScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const password = location.state?.senha;

  const basePath = tenantId ? `/${tenantId}` : '';
  const token = tenantId || 'e8aaf53b-a549-423c-8349-f189f03d0b5c';

  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    fetchTenantInfo(token)
      .then(setTenant)
      .catch(() => {});
  }, [token]);

  const timeLimit = (tenant?.sessionTimeoutMinutes || 40) * 60 * 1000;

  useEffect(() => {
    const accessTime = localStorage.getItem('waitForTurnAccessTime');
    const now = Date.now();

    if (!accessTime || now - parseInt(accessTime, 10) > timeLimit) {
      navigate(`${basePath}/`);
    }
  }, [navigate, basePath, timeLimit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('waitForTurnAccessTime');
      localStorage.removeItem('currentTenant');
      navigate(`${basePath}/`);
    }, timeLimit);

    return () => clearTimeout(timer);
  }, [navigate, basePath, timeLimit]);

  const instagramUrl = tenant?.instagramUrl || 'https://www.instagram.com/mrbarbearia_coimbra';
  const googleReviewUrl = tenant?.googleReviewUrl || 'https://www.google.com/search?q=MR+Barbearia+Cr%C3%ADticas';

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
        {instagramUrl && (
          <SocialSection
            title="Siga-nos nas redes sociais"
            icon={<InstaIcon />}
            link={instagramUrl}
            label="Instagram"
          />
        )}
        {googleReviewUrl && (
          <SocialSection
            title="Ajude-nos com sua avaliação"
            description="Sua opinião é muito importante! Clique no ícone abaixo para nos avaliar no Google."
            icon={<GoogleIcon />}
            link={googleReviewUrl}
            label="Google Avaliações"
          />
        )}
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
