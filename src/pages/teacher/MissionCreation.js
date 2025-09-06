import React, { useState } from 'react';
import MissionDevoir from './MissionDevoir';
import MissionCollective from './MissionCollective';
import MissionIndividuelle from './MissionIndividuelle';
import './MissionCreation.css';

export default function MissionCreationHub() {
  const [activeTab, setActiveTab] = useState('devoir');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'devoir':
        return <MissionDevoir />;
      case 'collective':
        return <MissionCollective />;
      case 'individuelle':
        return <MissionIndividuelle />;
      default:
        return null;
    }
  };

  return (
    <div className="mission-page">
      <div className="mission-card">
        <h1>Création des Missions</h1>

        <div className="tab-menu">
          <button 
            className={activeTab === 'devoir' ? 'active' : ''} 
            onClick={() => setActiveTab('devoir')}
          >
            Devoirs
          </button>
          <button 
            className={activeTab === 'collective' ? 'active' : ''} 
            onClick={() => setActiveTab('collective')}
          >
            Collectives
          </button>
          <button 
            className={activeTab === 'individuelle' ? 'active' : ''} 
            onClick={() => setActiveTab('individuelle')}
          >
            Individuelles
          </button>
        </div>

        <div className="tab-content">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}
