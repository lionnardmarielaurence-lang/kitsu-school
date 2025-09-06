import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* HEADER avec logo et titre */}
      <div className="home-header">
        <img 
          src="https://res.cloudinary.com/dtgnkoafc/image/upload/v1755288275/jhzrnenrr9zr3dommt04.png" 
          alt="Logo KITSU" 
          className="home-logo"
        />
        <h1 className="home-title">KITSU</h1>
      </div>

      {/* GRID des cartes */}
      <div className="home-card-grid">
        <div className="home-card" onClick={() => navigate('/register-student')}>
          Enregistrement élève
        </div>
        <div className="home-card" onClick={() => navigate('/register-teacher')}>
          Enregistrement professeur
        </div>
        <div className="home-card" onClick={() => navigate('/login-student')}>
          Login élève
        </div>
        <div className="home-card" onClick={() => navigate('/login-teacher')}>
          Login professeur
        </div>
      </div>
    </div>
  );
}
