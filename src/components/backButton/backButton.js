import React from 'react';
import { useNavigate } from 'react-router-dom';
import './backButton.css';

const BackButton = ({ to = '/' }) => {
  const navigate = useNavigate();

  return (
    <button
      className="back-button"
      onClick={() => navigate(to)}
      aria-label="Voltar"
    >
      ← Voltar
    </button>
  );
};

export default BackButton;
