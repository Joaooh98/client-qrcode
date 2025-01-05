import './App.css';
import RetrievePasswordScreen from './components/retrivePasswordScreen/retrievePasswordScreen';
import WaitForTurnScreen from './components/waitForTurnScreen/waitForTurnScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RetrievePasswordScreen />} />
          <Route path="/retrieve-password" element={<RetrievePasswordScreen />} />
          <Route path="/wait-for-turn" element={<WaitForTurnScreen />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
