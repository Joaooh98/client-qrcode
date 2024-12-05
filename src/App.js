import './App.css';
import RetrievePasswordScreen from './components/retrivePasswordScreen/retrievePasswordScreen';
import WaitForTurnScreen from './components/waitForTurnScreen/waitForTurnScreen';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="App">
        {/* Menu de navegação */}
        <nav className="navigation">
          <Link to="/retrieve-password" className="nav-link">QR Code</Link>
          <span className="nav-separator">|</span>
          <Link to="/wait-for-turn" className="nav-link">Senha Cliente</Link>
        </nav>

        <Routes>
          {/* Tela do QR Code */}
          <Route path="/retrieve-password" element={<RetrievePasswordScreen />} />

          {/* Tela que mostra a senha do cliente */}
          <Route path="/wait-for-turn" element={<WaitForTurnScreen />} />

          {/* Rota inicial padrão */}
          <Route path="/" element={<RetrievePasswordScreen />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
