// src/pages/student/MissionCollectiveStudent.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../Firebase';
import "./StudentMission.css";

export default function MissionCollectiveStudent() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMissions = async () => {
      setLoading(true);
      setError("");

      try {
        const missionsCollection = collection(db, 'missionsCollectives');
        const missionsSnapshot = await getDocs(missionsCollection);

        if (missionsSnapshot.empty) {
          setMissions([]);
          return;
        }

        const missionsList = missionsSnapshot.docs.map(doc => ({
          id: doc.id,
          titre: doc.data().title || 'Sans titre',
          details: doc.data().details || 'Aucun détail disponible.',
          xp: doc.data().xp || 0,
          mana: doc.data().mana || 0,
          kitsuCoins: doc.data().kitsuCoins || 0,
          progression: doc.data().progression || 0,
          completed: doc.data().completed || false
        }));

        setMissions(missionsList);
      } catch (err) {
        console.error("Erreur en récupérant les missions : ", err);
        setError("Impossible de charger les missions. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  if (loading) return (
    <div className="student-missions-wrapper">
      <p>Chargement des missions...</p>
    </div>
  );

  if (error) return <p className="student-missions-wrapper">{error}</p>;

  return (
    <div className="student-missions-wrapper">
      <h2>Missions Collectives</h2>
      {missions.length === 0 ? (
        <p>Aucune mission disponible pour le moment.</p>
      ) : (
        <div className="student-missions-container">
          {missions.map(mission => (
            <div key={mission.id} className="student-mission-card">
              <h3>{mission.titre}</h3>
              <p>{mission.details}</p>

              {/* Barre de progression */}
              <div className="student-mission-progress">
                <div
                  className="student-mission-progress-fill"
                  style={{ width: `${mission.progression}%` }}
                ></div>
              </div>

              {/* Statistiques */}
              <p>XP : {mission.xp}</p>
              <p>Mana : {mission.mana}</p>
              <p>KitsuCoins : {mission.kitsuCoins}</p>

              {/* Bouton ou état */}
              {mission.completed ? (
                <p className="student-mission-completed">Mission accomplie ✅</p>
              ) : (
                <button>Participer</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
