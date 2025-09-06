import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../Firebase";
import "./RewardManagement.css"; // Réutilisation du style global

const RewardCollective = () => {
  const [rewards, setRewards] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    mana: "",
  });

  // 🔹 Écoute en temps réel de la collection CollectiveRewards
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "CollectiveRewards"), (snapshot) => {
      const rewardsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRewards(rewardsArray);
    });
    return () => unsub();
  }, []);

  // 🔹 Ajouter une récompense collective
  const handleAddReward = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.mana) return;

    try {
      await addDoc(collection(db, "CollectiveRewards"), {
        title: formData.title,
        details: formData.details,
        mana: Number(formData.mana),
        progress: 0,
        createdAt: new Date(),
      });
      setFormData({ title: "", details: "", mana: "" });
    } catch (err) {
      console.error("Erreur ajout reward collective:", err);
    }
  };

  // 🔹 Modifier une récompense collective
  const handleEditReward = async (id, field, value) => {
    try {
      const rewardRef = doc(db, "CollectiveRewards", id);
      await updateDoc(rewardRef, {
        [field]:
          field === "mana" || field === "progress" ? Number(value) : value,
      });
    } catch (err) {
      console.error("Erreur update reward collective:", err);
    }
  };

  // 🔹 Supprimer une récompense collective
  const handleDeleteReward = async (id) => {
    try {
      const rewardRef = doc(db, "CollectiveRewards", id);
      await deleteDoc(rewardRef);
    } catch (err) {
      console.error("Erreur suppression reward collective:", err);
    }
  };

  return (
    <div className="reward-collective-container">
      {/* Formulaire de création */}
      <div className="reward-card">
        <h2>Créer une récompense collective</h2>
        <form onSubmit={handleAddReward} className="reward-form">
          <input
            type="text"
            placeholder="Titre"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Détails"
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Objectif Mana"
            value={formData.mana}
            onChange={(e) =>
              setFormData({ ...formData, mana: e.target.value })
            }
            required
          />
          <div className="mission-buttons">
            <button type="submit" className="add-button">
              Ajouter
            </button>
          </div>
        </form>
      </div>

      {/* Liste des récompenses collectives */}
      <div className="rewards-grid">
        {rewards.length === 0 ? (
          <p className="no-rewards">Aucune récompense collective disponible.</p>
        ) : (
          rewards.map((reward) => {
            const percent = Math.min(
              100,
              Math.round((reward.progress / reward.mana) * 100)
            );

            return (
              <div key={reward.id} className="reward-card">
                <input
                  type="text"
                  value={reward.title}
                  onChange={(e) =>
                    handleEditReward(reward.id, "title", e.target.value)
                  }
                  className="reward-input"
                />
                <textarea
                  value={reward.details || ""}
                  onChange={(e) =>
                    handleEditReward(reward.id, "details", e.target.value)
                  }
                  className="reward-input"
                />

                {/* Barre de progression */}
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  🔥 {reward.progress} / {reward.mana} mana ({percent}%)
                </p>

                <div className="mission-buttons">
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteReward(reward.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RewardCollective;
