import React, { useState } from "react";
import RewardIndividuel from "./RewardIndividuel";
import RewardCollective from "./RewardCollective";
import "./RewardManagement.css";

export default function RewardManagement() {
  const [activeTab, setActiveTab] = useState("individuel");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "individuel":
        return <RewardIndividuel />;
      case "collective":
        return <RewardCollective />;
      default:
        return null;
    }
  };

  return (
    <div className="reward-wrapper"> {/* Grand conteneur arrière */}
      <div className="reward-page">
        <div className="reward-card">
          <h1>Gestion des Récompenses</h1>

          <div className="tab-menu">
            <button
              className={activeTab === "individuel" ? "active" : ""}
              onClick={() => setActiveTab("individuel")}
            >
              Individuelles
            </button>
            <button
              className={activeTab === "collective" ? "active" : ""}
              onClick={() => setActiveTab("collective")}
            >
              Collectives
            </button>
          </div>

          <div className="tab-content">{renderActiveTab()}</div>
        </div>
      </div>
    </div>
  );
}
