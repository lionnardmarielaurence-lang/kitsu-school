import React, { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs, doc, updateDoc, query, where, serverTimestamp } from "firebase/firestore";
import './StudentMission.css';

export default function StudentMissionIndividuelle({ studentData }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const missionsRef = collection(db, "missionsIndividuelles");
        const q = query(
          missionsRef,
          where("studentId", "==", studentData.username)
        );
        const snapshot = await getDocs(q);
        setMissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Erreur récupération missions individuelles :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [studentData.username]);

  const markAsCompleted = async (mission) => {
    if (mission.status === "Terminée" || mission.status === "à valider") {
      alert("Cette mission est déjà terminée ou en attente de validation.");
      return;
    }

    try {
      const missionRef = doc(db, "missionsIndividuelles", mission.id);
      await updateDoc(missionRef, {
        status: "à valider",
        submittedAt: serverTimestamp(),
      });

      setMissions(prev =>
        prev.map(m =>
          m.id === mission.id ? { ...m, status: "à valider" } : m
        )
      );

      alert(`Mission "${mission.titre}" marquée comme terminée et à valider !`);
    } catch (error) {
      console.error("Erreur mise à jour mission :", error);
    }
  };

  if (loading) return <p>Chargement des missions individuelles...</p>;

  const getStatusLabel = (status) => {
    switch (status) {
      case "En cours":
        return "⏳ En cours";
      case "à valider":
        return "🕒 À valider";
      case "Terminée":
        return "✔️ Terminée";
      case "confirmée":
        return "✅ Confirmée";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="student-missions-wrapper">
      <h2>Missions Individuelles</h2>
      {missions.length === 0 ? (
        <p>Aucune mission individuelle pour le moment.</p>
      ) : (
        <table className="student-missions-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Description</th>
              <th>XP</th>
              <th>Mana</th>
              <th>KitsuCoins</th>
              <th>Date butoir</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {missions.map(mission => (
              <tr key={mission.id}>
                <td>{mission.titre}</td>
                <td>{mission.details}</td>
                <td>{mission.xp}</td>
                <td>{mission.mana}</td>
                <td>{mission.kitsuCoins}</td>
                <td className="deadline">{formatDate(mission.deadline)}</td>
                <td className={
                  mission.status === "En cours" ? "status-en-cours" :
                  mission.status === "à valider" ? "status-a-valider" :
                  mission.status === "Terminée" ? "status-terminee" :
                  mission.status === "confirmée" ? "status-confirmee" : ""
                }>
                  {getStatusLabel(mission.status)}
                </td>
                <td>
                  {mission.status === "En cours" && (
                    <button onClick={() => markAsCompleted(mission)}>
                      Terminer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
