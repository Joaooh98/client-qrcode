import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchQueueStatus,
  fetchCallNext,
  fetchResetQueue,
  fetchQrCode,
  fetchTenantInfo,
  fetchUpdateTenant,
} from '../../utils/fetchPassword';
import './adminDashboard.css';

const AdminDashboard = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const jwt = localStorage.getItem('jwt');
  const token = tenantId || localStorage.getItem('tenantToken');

  const [activeTab, setActiveTab] = useState('queue');
  const [queue, setQueue] = useState({ currentServing: 0, waitingCount: 0, waitingPasswords: [] });
  const [lastCalled, setLastCalled] = useState(null);
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [tenant, setTenant] = useState(null);
  const [settingsForm, setSettingsForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!jwt) {
      navigate('/login');
      return;
    }
  }, [jwt, navigate]);

  const loadQueue = useCallback(async () => {
    try {
      const data = await fetchQueueStatus(token);
      setQueue(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const loadTenant = useCallback(async () => {
    try {
      const data = await fetchTenantInfo(token);
      setTenant(data);
      setSettingsForm({
        businessName: data.businessName || '',
        instagramUrl: data.instagramUrl || '',
        googleReviewUrl: data.googleReviewUrl || '',
        sessionTimeoutMinutes: data.sessionTimeoutMinutes || 40,
      });
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const loadQrCode = useCallback(async () => {
    try {
      const svg = await fetchQrCode(token);
      setQrCodeSvg(svg);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadQueue();
    loadTenant();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [token, loadQueue, loadTenant]);

  useEffect(() => {
    if (activeTab === 'qrcode' && !qrCodeSvg) {
      loadQrCode();
    }
  }, [activeTab, qrCodeSvg, loadQrCode]);

  const handleCallNext = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await fetchCallNext(token, jwt);
      setLastCalled(data.password);
      setMessage(`Senha ${data.password} chamada!`);
      loadQueue();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Tem certeza que deseja resetar a fila?')) return;
    setLoading(true);
    try {
      await fetchResetQueue(token, jwt);
      setMessage('Fila resetada com sucesso');
      setLastCalled(null);
      loadQueue();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchUpdateTenant(token, settingsForm, jwt);
      setMessage('Configurações salvas!');
      loadTenant();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('tenantToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('businessName');
    navigate('/login');
  };

  const userName = localStorage.getItem('userName') || 'Admin';
  const businessName = tenant?.businessName || localStorage.getItem('businessName') || '';

  return (
    <div className="admin-container">
      <div
        className="background-animation"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/back-mrqrcode.png)` }}
      />

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-info">
          <h1 className="admin-business-name">{businessName}</h1>
          <span className="admin-user-name">{userName}</span>
        </div>
        <button onClick={handleLogout} className="admin-logout-btn">Sair</button>
      </header>

      {/* Tabs */}
      <nav className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          Fila
        </button>
        <button
          className={`admin-tab ${activeTab === 'qrcode' ? 'active' : ''}`}
          onClick={() => setActiveTab('qrcode')}
        >
          QR Code
        </button>
        <button
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Config
        </button>
      </nav>

      {/* Content */}
      <main className="admin-content">
        {message && <div className="admin-message">{message}</div>}

        {/* TAB: Fila */}
        {activeTab === 'queue' && (
          <div className="admin-queue">
            <div className="queue-stats">
              <div className="stat-card serving">
                <span className="stat-label">Atendendo</span>
                <span className="stat-number">{queue.currentServing || '—'}</span>
              </div>
              <div className="stat-card waiting">
                <span className="stat-label">Na fila</span>
                <span className="stat-number">{queue.waitingCount}</span>
              </div>
            </div>

            {lastCalled && (
              <div className="last-called">
                <span className="last-called-label">Senha chamada:</span>
                <span className="last-called-number">{lastCalled}</span>
              </div>
            )}

            <div className="queue-actions">
              <button
                className="call-next-btn"
                onClick={handleCallNext}
                disabled={loading || queue.waitingCount === 0}
              >
                {loading ? 'Chamando...' : 'Chamar Próxima'}
              </button>
              <button
                className="reset-btn"
                onClick={handleReset}
                disabled={loading}
              >
                Resetar Fila
              </button>
            </div>

            {queue.waitingPasswords.length > 0 && (
              <div className="queue-list">
                <h3 className="queue-list-title">Senhas aguardando:</h3>
                <div className="queue-badges">
                  {queue.waitingPasswords.map((num) => (
                    <span key={num} className="queue-badge">{num}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: QR Code */}
        {activeTab === 'qrcode' && (
          <div className="admin-qrcode">
            <h2 className="qrcode-title">QR Code do seu estabelecimento</h2>
            <p className="qrcode-desc">
              Imprima e coloque nas mesas para os clientes tirarem a senha.
            </p>
            {qrCodeSvg ? (
              <div
                className="qrcode-preview"
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              />
            ) : (
              <p>Carregando QR Code...</p>
            )}
            <p className="qrcode-url">
              URL: {window.location.origin}/{token}
            </p>
          </div>
        )}

        {/* TAB: Config */}
        {activeTab === 'settings' && (
          <div className="admin-settings">
            <h2 className="settings-title">Configurações do Estabelecimento</h2>
            <form onSubmit={handleSaveSettings} className="settings-form">
              <div className="form-group">
                <label htmlFor="s-businessName">Nome do estabelecimento</label>
                <input
                  id="s-businessName"
                  type="text"
                  value={settingsForm.businessName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="s-instagramUrl">Instagram URL</label>
                <input
                  id="s-instagramUrl"
                  type="url"
                  value={settingsForm.instagramUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="s-googleReviewUrl">Google Reviews URL</label>
                <input
                  id="s-googleReviewUrl"
                  type="url"
                  value={settingsForm.googleReviewUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, googleReviewUrl: e.target.value })}
                  placeholder="https://google.com/..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="s-timeout">Tempo de sessão (minutos)</label>
                <input
                  id="s-timeout"
                  type="number"
                  value={settingsForm.sessionTimeoutMinutes}
                  onChange={(e) => setSettingsForm({ ...settingsForm, sessionTimeoutMinutes: parseInt(e.target.value, 10) })}
                  min={5}
                  max={120}
                />
              </div>
              <button type="submit" className="save-settings-btn" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
