import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRegister } from '../../utils/fetchPassword';
import './registerScreen.css';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    instagramUrl: '',
    googleReviewUrl: '',
    sessionTimeoutMinutes: 40,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchRegister({
        ...form,
        sessionTimeoutMinutes: parseInt(form.sessionTimeoutMinutes, 10),
      });

      localStorage.setItem('jwt', data.token);
      localStorage.setItem('tenantToken', data.tenantToken);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('businessName', data.businessName);

      navigate(`/admin/${data.tenantToken}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div
        className="background-animation"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/back-mrqrcode.png)` }}
      />

      <div className="register-card">
        <h1 className="register-title">Criar Conta</h1>
        <p className="register-subtitle">Cadastre seu estabelecimento</p>

        <form onSubmit={handleRegister} className="register-form">
          {error && <div className="register-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Seu nome</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="João Silva"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="businessName">Nome do estabelecimento</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Minha Barbearia"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="instagramUrl">Instagram (opcional)</label>
              <input
                id="instagramUrl"
                name="instagramUrl"
                type="url"
                value={form.instagramUrl}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="googleReviewUrl">Google Reviews (opcional)</label>
              <input
                id="googleReviewUrl"
                name="googleReviewUrl"
                type="url"
                value={form.googleReviewUrl}
                onChange={handleChange}
                placeholder="https://google.com/..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sessionTimeoutMinutes">Tempo da sessão (minutos)</label>
            <input
              id="sessionTimeoutMinutes"
              name="sessionTimeoutMinutes"
              type="number"
              value={form.sessionTimeoutMinutes}
              onChange={handleChange}
              min={5}
              max={120}
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner" />
                Cadastrando...
              </>
            ) : (
              'Cadastrar'
            )}
          </button>
        </form>

        <p className="register-login-link">
          Já tem conta?{' '}
          <button onClick={() => navigate('/login')} className="link-button">
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;
