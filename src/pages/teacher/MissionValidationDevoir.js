import React, { useEffect, useState } from "react";
import {
  collectionGroup,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/config";

export default function MissionValidationDevoirs() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState("");

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const missionsRef = collectionGroup(db, "missionsDevoirs");

        // Requête filtrée + triée côté serveur
        const q = query(
          missionsRef,
          where("status", "==", "à valider"),
          orderBy("submittedAt", "desc")
        );

        const snapshot = await getDocs(q);

        const missionsData = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const pathParts = docSnap.ref.path.split("/");
          const username = pathParts[1];

          return {
            id: docSnap.id,
            username,
            xp: typeof data.xp === "number" ? data.xp : 0,
            mana: typeof data.mana === "number" ? data.mana : 0,
            kitsuCoins: typeof data.kitsuCoins === "number" ? data.kitsuCoins : 0,
            status: data.status || "à valider",
            titre: data.titre || "",
            deadline: data.deadline || null,
            submittedAt: data.submittedAt || null,
          };
        });

        setMissions(missionsData);
      } catch (err) {
        console.error(err);
        setError(
          "Impossible de récupérer les devoirs à valider. Assurez-vous que l'index Firestore pour collectionGroup est créé."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  const handleConfirm = async (missionId, username, missionData) => {
    if (!missionId || !username) {
      alert("ID de mission ou nom d'utilisateur manquant !");
      return;
    }

    setConfirming(missionId);

    try {
      const missionRef = doc(db, "users", username, "missionsDevoirs", missionId);
      const missionSnap = await getDoc(missionRef);

      if (!missionSnap.exists()) {
        alert(`Devoir introuvable pour l'élève ${username} !`);
        setConfirming("");
        return;
      }

      await updateDoc(missionRef, { status: "confirmée" });

      const userRef = doc(db, "Students", username);
      await updateDoc(userRef, {
        xp: increment(missionData.xp),
        mana: increment(missionData.mana),
        kitsuCoins: increment(missionData.kitsuCoins),
      });

      alert("Devoir confirmé et récompenses distribuées !");

      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId && m.username === username
            ? { ...m, status: "confirmée" }
            : m
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la confirmation : " + err.message);
    } finally {
      setConfirming("");
    }
  };

  if (loading) return <p>Chargement des devoirs à valider...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="mission-validation-container">
      <h1>Devoirs à valider</h1>
      {missions.length === 0 ? (
        <p>Aucun devoir à valider pour le moment.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Titre</th>
              <th>XP</th>
              <th>Mana</th>
              <th>KitsuCoins</th>
              <th>Deadline</th>
              <th>Statut</th>
              <th>Date de soumission</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => (
              <tr key={mission.username + "-" + mission.id}>
                <td>{mission.username}</td>
                <td>{mission.titre}</td>
                <td>{mission.xp}</td>
                <td>{mission.mana}</td>
                <td>{mission.kitsuCoins}</td>
                <td>{mission.deadline?.toDate?.()?.toLocaleDateString() || ""}</td>
                <td>{mission.status}</td>
                <td>{mission.submittedAt?.toDate?.()?.toLocaleString() || ""}</td>
                <td>
                  {mission.status === "à valider" ? (
                    <button
                      onClick={() =>
                        handleConfirm(mission.id, mission.username, mission)
                      }
                      disabled={confirming === mission.id}
                    >
                      {confirming === mission.id ? "Confirmation..." : "Confirmer"}
                    </button>
                  ) : (
                    "✅ Confirmé"
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
