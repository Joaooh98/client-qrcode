import './App.css';
import RetrievePasswordScreen from './components/retrivePasswordScreen/retrievePasswordScreen';
import WaitForTurnScreen from './components/waitForTurnScreen/waitForTurnScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/retrieve-password" element={<RetrievePasswordScreen />} />
          <Route path="/wait-for-turn" element={<WaitForTurnScreen />} />
          <Route path="/" element={<RetrievePasswordScreen />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
