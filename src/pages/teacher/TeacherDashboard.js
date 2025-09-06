// src/pages/teacher/TeacherDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../Firebase";
import { signOut } from "firebase/auth";

import MissionCreation from "./MissionCreation";
import RewardManagement from "./RewardManagement";
import MissionValidation from "./MissionValidation";
import Purchases from "./Purchases";
import StudentManagement from "./StudentManagement";
import Messaging from "./Messaging";
import TeacherProfil from "./TeacherProfil";

import { FiLogOut, FiMenu } from "react-icons/fi";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("profil");
  const [token, setToken] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Vérification utilisateur connecté
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/login-teacher");
      else {
        setTeacher(user);
        setTeacherId(user.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Récupération du token
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (teacher) {
        const docRef = doc(db, "Teachers", teacher.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setToken(docSnap.data().token || "");
      }
    };
    fetchTeacherData();
  }, [teacher]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login-teacher");
  };

  if (loading) return <p>Chargement du tableau de bord...</p>;

  const pages = {
    profil: <TeacherProfil />,
    students: <StudentManagement />,
    missions: <MissionCreation />,
    validation: <MissionValidation teacherId={teacherId} />,
    rewards: <RewardManagement />,
    purchases: <Purchases />,
    messaging: <Messaging />,
  };

  const pageLabels = {
    profil: "Profil",
    students: "Gestion des élèves",
    missions: "Création de missions",
    validation: "Validation des missions",
    rewards: "Création de récompenses",
    purchases: "Achats élèves",
    messaging: "Messagerie",
  };

  return (
    <div className="TeacherDashboard-container">
      {/* Hamburger */}
      <button
        className="TeacherDashboard-hamburger-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <FiMenu size={24} />
      </button>

      {/* Déconnexion */}
      <button
        className="TeacherDashboard-logout-button"
        onClick={handleLogout}
      >
        <FiLogOut size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`TeacherDashboard-sidebar ${
          sidebarOpen ? "open" : "collapsed"
        }`}
      >
        <div className="TeacherDashboard-logo-container">
          <img
            src="https://res.cloudinary.com/dtgnkoafc/image/upload/v1755288275/jhzrnenrr9zr3dommt04.png"
            alt="Kitsu Logo"
            className="TeacherDashboard-logo"
          />
        </div>

        <nav className="TeacherDashboard-menu-container">
          {Object.keys(pages).map((key) => (
            <button
              key={key}
              className={`TeacherDashboard-menu-button ${
                activePage === key ? "active" : ""
              }`}
              onClick={() => setActivePage(key)}
              title={!sidebarOpen ? pageLabels[key] : ""}
            >
              {pageLabels[key]}
            </button>
          ))}
        </nav>

        <div className="TeacherDashboard-bottom-section">
          <p className="TeacherDashboard-token-text">Token: {token}</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="TeacherDashboard-content">{pages[activePage]}</div>
    </div>
  );
}
