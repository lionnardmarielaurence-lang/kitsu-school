// src/pages/teacher/MissionValidationCollective.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../Firebase';
import './Missions.css';

export default function MissionValidationCollective() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingMissionId, setProcessingMissionId] = useState(null);

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
          ...doc.data()
        }));

        setMissions(missionsList);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les missions.");
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  const handleValidateMission = async (mission) => {
    setProcessingMissionId(mission.id);
    setError("");

    try {
      // Récupérer tous les élèves
      const studentsSnapshot = await getDocs(collection(db, 'Students'));
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Distribuer les récompenses correctement en respectant la casse
      const updatePromises = students.map(student => {
        const studentRef = doc(db, 'Students', student.id);
        return updateDoc(studentRef, {
          xp: (student.xp ?? 0) + (mission.xp ?? 0),
          mana: (student.mana ?? 0) + (mission.mana ?? 0),
          kitsuCoins: (student.kitsuCoins ?? 0) + (mission.kitsuCoins ?? 0)
        });
      });

      await Promise.all(updatePromises);

      // Marquer la mission comme validée
      const missionRef = doc(db, 'missionsCollectives', mission.id);
      await updateDoc(missionRef, { validated: true });

      alert(`Mission "${mission.titre}" validée et récompenses distribuées !`);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la validation de la mission.");
    } finally {
      setProcessingMissionId(null);
    }
  };

  if (loading) return <p>Chargement des missions...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="missions-teacher">
      <h2>Validation des Missions Collectives</h2>
      {missions.length === 0 ? (
        <p>Aucune mission disponible.</p>
      ) : (
        <table className="missions-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Détails</th>
              <th>XP</th>
              <th>Mana</th>
              <th>KitsuCoins</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {missions.map(mission => (
              <tr key={mission.id}>
                <td>{mission.titre || 'Sans titre'}</td>
                <td>{mission.details || 'Aucun détail'}</td>
                <td>{mission.xp || 0}</td>
                <td>{mission.mana || 0}</td>
                <td>{mission.kitsuCoins || 0}</td>
                <td>{mission.validated ? 'Validée' : 'En attente'}</td>
                <td>
                  <button
                    onClick={() => handleValidateMission(mission)}
                    disabled={mission.validated || processingMissionId === mission.id}
                  >
                    {processingMissionId === mission.id ? 'Traitement...' : 'Valider'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
