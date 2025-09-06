import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../Firebase";

import StudentProfil from "./StudentProfil";
import StudentMission from "./StudentMission";
import StudentRewards from "./StudentRewards";
import StudentMessaging from "./StudentMessaging";
import SanctuaireDeMana from "./SanctuaireDeMana";

import { raceColors } from "./raceColors";
import "./StudentDashboard.css";

const MENU_ITEMS = [
  { id: "profil", label: "Fiche du Héros" },
  { id: "mission", label: "Quêtes" },
  { id: "rewards", label: "Récompenses du royaume" },
  { id: "sanctuaire", label: "Sanctuaire de Mana" },
  { id: "messaging", label: "Table des scribes" },
];

export default function StudentDashboard() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("profil");

  // Vérification de connexion
  useEffect(() => {
    const loggedUser = localStorage.getItem("currentStudent");
    if (!loggedUser || loggedUser.toLowerCase() !== username.toLowerCase()) {
      navigate("/login-student");
    }
  }, [username, navigate]);

  // Récupération des données depuis Firebase
  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, "Students", username.toLowerCase());

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setStudentData(docSnap.data());
          setError("");
        } else {
          setError("Étudiant non trouvé.");
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Erreur lors de la récupération des données.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [username]);

  // Calcul des progressions
  const xpLevel = studentData ? Math.floor(studentData.xp / 1000) : 0;
  const xpCurrent = studentData ? studentData.xp : 0;
  const xpProgress = studentData ? Math.min((studentData.xp % 1000) / 10, 100) : 0;

  const manaCurrent = studentData ? studentData.mana || 0 : 0;
  const manaProgress = Math.min((manaCurrent / 250) * 100, 100);

  const kitsuCoinsCurrent = studentData ? studentData.kitsuCoins || 0 : 0;

  // Changement de page
  const handlePageChange = (page) => {
    if (page !== activePage) setActivePage(page);
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("currentStudent");
    navigate("/login-student");
  };

  // Rendu des pages
  const renderPage = () => {
    switch (activePage) {
      case "profil":
        return <StudentProfil studentData={studentData} />;
      case "mission":
        return <StudentMission studentData={studentData} />;
      case "rewards":
        return <StudentRewards studentData={studentData} />;
      case "messaging":
        return <StudentMessaging studentData={studentData} />;
      case "sanctuaire":
        return <SanctuaireDeMana />;
      default:
        return <StudentProfil studentData={studentData} />;
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="error-message">{error}</p>;

  // Couleurs dynamiques selon la race
  const colors =
    studentData && raceColors[studentData.race]
      ? raceColors[studentData.race]
      : { primary: "#e0f7f7", accent: "#123334", aura: "#36a2a3" };

  return (
    <div
      className="student-dashboard"
      style={{
        "--color-primary": colors.primary,
        "--color-accent": colors.accent,
        "--color-aura": colors.aura,
        backgroundColor: colors.primary,
      }}
    >
      <aside className="sidebar" style={{ backgroundColor: colors.primary }}>
        <div className="top-reserve"></div>

        {studentData && (
          <div className="mini-profil">
            {studentData.photoURL && (
              <div className="profile-photo-container">
                <img
                  src={studentData.photoURL}
                  alt={`${studentData.username || "Profil"} photo`}
                  className="profile-photo"
                />
              </div>
            )}

            <div className="profile-info">
              <div className="level-text">🪙 Niveau {xpLevel}</div>

              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xpProgress}%` }}>
                  {xpCurrent} XP
                </div>
              </div>

              <div className="mana-bar">
                <div className="mana-fill" style={{ width: `${manaProgress}%` }}>
                  {manaCurrent} Mana
                </div>
              </div>

              <div className="kitsu-coins">💰 {kitsuCoinsCurrent} KitsuCoins</div>
            </div>
          </div>
        )}

        <h2>Menu</h2>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            className={activePage === item.id ? "active" : ""}
            onClick={() => handlePageChange(item.id)}
          >
            {item.label}
          </button>
        ))}

        <button className="logout-button" onClick={handleLogout}>
          Déconnexion
        </button>
      </aside>

      <main className={`student-content ${activePage ? "active-glow" : ""}`}>
        {renderPage()}
      </main>
    </div>
  );
}
