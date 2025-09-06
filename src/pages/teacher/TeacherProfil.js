import React, { useEffect, useState } from "react";
import { db, auth } from '../../Firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./TeacherProfil.css";

export default function TeacherProfil() {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingToken, setUpdatingToken] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchTeacherData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "Teachers", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTeacherData(docSnap.data());
        } else {
          setError("Profil professeur introuvable.");
        }
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la récupération du profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const regenerateToken = async () => {
    if (!teacherData) return;

    setUpdatingToken(true);
    try {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let newToken = "";
      for (let i = 0; i < 6; i++) {
        newToken += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const user = auth.currentUser;
      const docRef = doc(db, "Teachers", user.uid);

      await updateDoc(docRef, { token: newToken });
      setTeacherData({ ...teacherData, token: newToken });

      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la régénération du token.");
    } finally {
      setUpdatingToken(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>Chargement du profil...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red", marginTop: "40px" }}>{error}</p>;

  return (
    <div className="TeacherProfil-card">
      <h2>Profil du Professeur</h2>
      <div className="TeacherProfil-info">
        <p><strong>Nom :</strong> {teacherData.lastName}</p>
        <p><strong>Prénom :</strong> {teacherData.firstName}</p>
        <p><strong>Adresse mail :</strong> {teacherData.email}</p>
        <div className="TeacherProfil-token-section">
          <span className="TeacherProfil-token">{teacherData.token}</span>
          <button
            className="TeacherProfil-regenerate-btn"
            onClick={regenerateToken}
            disabled={updatingToken}
          >
            {updatingToken ? "Mise à jour..." : "Régénérer"}
          </button>
        </div>
      </div>
      {showConfirmation && <div className="TeacherProfil-confirmation">Token régénéré !</div>}
    </div>
  );
}
