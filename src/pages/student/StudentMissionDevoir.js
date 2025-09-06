// src/pages/student/StudentMissionDevoir.js
import React, { useEffect, useState } from "react";
import { db } from '../../Firebase';
import "./StudentMission.css";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

export default function StudentMissionDevoir({ studentData }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const missionsRef = collection(db, "missions");
        const q = query(missionsRef, where("status", "==", "available"));
        const snapshot = await getDocs(q);
        const missionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Vérifier les missions déjà soumises
        const studentMissionsRef = collection(
          db,
          "users",
          studentData.username,
          "missionsDevoirs"
        );
        const submittedSnapshot = await getDocs(studentMissionsRef);
        const submittedMissionIds = submittedSnapshot.docs.map(
          (doc) => doc.data().missionId
        );

        const filteredMissions = missionsList.filter(
          (mission) => !submittedMissionIds.includes(mission.id)
        );

        setMissions(filteredMissions);
      } catch (error) {
        console.error("Erreur lors de la récupération des missions :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [studentData.username]);

  const submitMission = async (mission) => {
    try {
      const studentMissionRef = collection(
        db,
        "users",
        studentData.username,
        "missionsDevoirs"
      );

      await addDoc(studentMissionRef, {
        missionId: mission.id,
        titre: mission.titre,
        description: mission.description || "",
        xp: mission.xp,
        mana: mission.mana || 0,
        kitsuCoins: mission.kitsuCoins || 0,
        deadline: mission.deadline || null,
        status: "à valider",
        submittedAt: serverTimestamp(),
      });

      alert(`Mission "${mission.titre}" soumise pour validation !`);
      setMissions((prev) => prev.filter((m) => m.id !== mission.id));
    } catch (error) {
      console.error("Erreur lors de la soumission de la mission :", error);
    }
  };

  if (loading) return <p>Chargement des missions...</p>;

  return (
    <div className="student-missions-wrapper">
      <h2>Missions de l'Académie</h2>

      {missions.length === 0 ? (
        <p>Aucune mission disponible pour le moment.</p>
      ) : (
        <div className="student-missions-container">
          {missions.map((mission) => (
            <div key={mission.id} className="student-mission-card">
              <h3>{mission.titre}</h3>
              <p>{mission.description || "Aucune description."}</p>
              <p>XP : {mission.xp}</p>
              <p>Mana : {mission.mana || 0}</p>
              <p>KitsuCoins : {mission.kitsuCoins || 0}</p>
              <p>
                Date limite :{" "}
                {mission.deadline
                  ? new Date(mission.deadline.seconds * 1000).toLocaleDateString()
                  : "—"}
              </p>

              <button onClick={() => submitMission(mission)}>
                Soumettre
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
