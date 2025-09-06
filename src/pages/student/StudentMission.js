// src/pages/student/StudentMission.js
import React, { useState } from "react";
import StudentMissionDevoir from "./StudentMissionDevoir";
import StudentMissionIndividuelle from "./StudentMissionIndividuelle";
import StudentMissionCollective from "./StudentMissionCollective";
import "./StudentMission.css";

export default function StudentMission({ studentData, accentColor }) {
  const [activeQuest, setActiveQuest] = useState("");

  const quests = [
    { id: "devoir", label: "Mandats de l'Académie" },
    { id: "individuelle", label: "Épreuves Solitaires" },
    { id: "collective", label: "Expéditions Collectives" },
  ];

  return (
    <div className="student-missions-wrapper">
      <h2>Mes Missions</h2>

      {/* Boutons de sélection de type de mission */}
      <div className="hub student-quest-buttons" style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        {quests.map((q) => (
          <button
            key={q.id}
            className={`student-mission-card-button ${activeQuest === q.id ? "active" : ""}`}
            style={{
              border: `2px solid ${accentColor || "#123334"}`,
              backgroundColor: activeQuest === q.id ? accentColor || "#123334" : "#fff",
              color: activeQuest === q.id ? "#fff" : accentColor || "#123334",
            }}
            onClick={() => setActiveQuest(q.id)}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Contenu dynamique selon la quête sélectionnée */}
      <div className="student-missions-container">
        {activeQuest === "devoir" && <StudentMissionDevoir studentData={studentData} />}
        {activeQuest === "individuelle" && <StudentMissionIndividuelle studentData={studentData} />}
        {activeQuest === "collective" && <StudentMissionCollective studentData={studentData} />}
        {!activeQuest && <p>Veuillez sélectionner un type de mission ci-dessus.</p>}
      </div>
    </div>
  );
}
