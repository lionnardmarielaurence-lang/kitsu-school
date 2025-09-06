import React, { useState } from 'react';
import MissionValidationDevoir from './MissionValidationDevoir';
import MissionValidationCollective from './MissionValidationCollective';
import MissionValidationIndividuelle from './MissionValidationIndividuelle';
import './MissionValidation.css';

export default function MissionValidation() {
  const [activeTab, setActiveTab] = useState('individuelle');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'devoir':
        return <MissionValidationDevoir />;
      case 'collective':
        return <MissionValidationCollective />;
      case 'individuelle':
        return <MissionValidationIndividuelle />;
      default:
        return null;
    }
  };

  return (
    <div className="mission-container">
      <h1>Validation des Missions</h1>

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

      <div className="tab-content">{renderActiveTab()}</div>
    </div>
  );
}
