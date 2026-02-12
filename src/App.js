import './App.css';
import RetrievePasswordScreen from './components/retrivePasswordScreen/retrievePasswordScreen';
import WaitForTurnScreen from './components/waitForTurnScreen/waitForTurnScreen';
import LoginScreen from './components/loginScreen/loginScreen';
import RegisterScreen from './components/registerScreen/registerScreen';
import AdminDashboard from './components/adminDashboard/adminDashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />

          {/* Admin */}
          <Route path="/admin/:tenantId" element={<AdminDashboard />} />

          {/* Rotas padrão (tenant default) */}
          <Route path="/" element={<RetrievePasswordScreen />} />
          <Route path="/retrieve-password" element={<RetrievePasswordScreen />} />
          <Route path="/wait-for-turn" element={<WaitForTurnScreen />} />

          {/* Rotas multi-tenant: /:tenantId */}
          <Route path="/:tenantId" element={<RetrievePasswordScreen />} />
          <Route path="/:tenantId/retrieve-password" element={<RetrievePasswordScreen />} />
          <Route path="/:tenantId/wait-for-turn" element={<WaitForTurnScreen />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
