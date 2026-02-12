import './App.css';
import RetrievePasswordScreen from './components/retrivePasswordScreen/retrievePasswordScreen';
import WaitForTurnScreen from './components/waitForTurnScreen/waitForTurnScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
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
