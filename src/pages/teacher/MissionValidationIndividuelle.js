// src/pages/admin/MissionValidationIndividuelle.js
import React, { useEffect, useState } from "react";
import { db } from '../../Firebase';
import "./MissionValidation.css";
import {
  collectionGroup,
  getDocs,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  doc,
} from "firebase/firestore";

export default function MissionValidationIndividuelle() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState("");

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const missionsRef = collectionGroup(db, "missionsIndividuelles");
        const q = query(
          missionsRef,
          where("status", "==", "à valider"),
          orderBy("submittedAt", "desc")
        );

        const snapshot = await getDocs(q);
        const missionsData = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const studentId = data.studentId; // ID élève depuis le document

          return {
            id: docSnap.id,
            ref: docSnap.ref,
            studentId,
            xp: data.xp || 0,
            mana: data.mana || 0,
            kitsuCoins: data.kitsuCoins || 0,
            status: data.status,
            title: data.title,
            description: data.description,
            submittedAt: data.submittedAt || null,
          };
        });

        setMissions(missionsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  const handleConfirm = async (missionId, studentId, missionData, missionRef) => {
    if (!missionRef || !studentId) return;

    setConfirming(missionId);

    try {
      // Mise à jour du statut de la mission
      await updateDoc(missionRef, { status: "confirmée" });

      // Mise à jour des récompenses de l'élève
      const userRef = doc(db, "Students", studentId);
      await updateDoc(userRef, {
        xp: increment(missionData.xp),
        mana: increment(missionData.mana),
        kitsuCoins: increment(missionData.kitsuCoins),
      });

      // Mise à jour locale
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId && m.studentId === studentId
            ? { ...m, status: "confirmée" }
            : m
        )
      );

      alert(`Mission "${missionData.title}" validée et récompenses distribuées !`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la confirmation : " + err.message);
    } finally {
      setConfirming("");
    }
  };

  if (loading) return <p>Chargement des missions à valider...</p>;

  return (
    <div className="student-missions-wrapper">
      <h2>Missions Individuelles à valider</h2>

      {missions.length === 0 ? (
        <p>Aucune mission à valider pour le moment.</p>
      ) : (
        <div className="student-missions-container">
          {missions.map((mission) => (
            <div key={mission.studentId + "-" + mission.id} className="student-mission-card">
              <h3>{mission.title}</h3>
              <p><strong>Élève :</strong> {mission.studentId}</p>
              <p>{mission.description}</p>
              <p>XP : {mission.xp}</p>
              <p>Mana : {mission.mana}</p>
              <p>KitsuCoins : {mission.kitsuCoins}</p>
              <p>
                Soumise le :{" "}
                {mission.submittedAt?.toDate
                  ? mission.submittedAt.toDate().toLocaleString()
                  : "—"}
              </p>
              <p>Statut : {mission.status}</p>

              {mission.status === "à valider" ? (
                <button
                  onClick={() =>
                    handleConfirm(mission.id, mission.studentId, mission, mission.ref)
                  }
                  disabled={confirming === mission.id}
                >
                  {confirming === mission.id ? "Confirmation..." : "Confirmer"}
                </button>
              ) : (
                <span>✅ Confirmée</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
