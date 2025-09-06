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

const RewardIndividuel = () => {
  const [rewards, setRewards] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    kitsuCoins: "",
    stock: "",
  });

  // 🔹 Écoute en temps réel de la collection Products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Products"), (snapshot) => {
      const rewardsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRewards(rewardsArray);
    });
    return () => unsub();
  }, []);

  // 🔹 Ajouter une récompense
  const handleAddReward = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.kitsuCoins || !formData.stock) return;

    try {
      await addDoc(collection(db, "Products"), {
        title: formData.title,
        details: formData.details,
        kitsuCoins: Number(formData.kitsuCoins),
        stock: Number(formData.stock),
      });
      setFormData({ title: "", details: "", kitsuCoins: "", stock: "" });
    } catch (err) {
      console.error("Erreur ajout reward:", err);
    }
  };

  // 🔹 Modifier une récompense
  const handleEditReward = async (id, field, value) => {
    try {
      const rewardRef = doc(db, "Products", id);
      await updateDoc(rewardRef, {
        [field]:
          field === "kitsuCoins" || field === "stock" ? Number(value) : value,
      });
    } catch (err) {
      console.error("Erreur update reward:", err);
    }
  };

  // 🔹 Supprimer une récompense
  const handleDeleteReward = async (id) => {
    try {
      const rewardRef = doc(db, "Products", id);
      await deleteDoc(rewardRef);
    } catch (err) {
      console.error("Erreur suppression reward:", err);
    }
  };

  return (
    <div className="reward-individuel-container">
      {/* Formulaire de création */}
      <div className="reward-card">
        <h2>Créer une récompense</h2>
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
            placeholder="KitsuCoins"
            value={formData.kitsuCoins}
            onChange={(e) =>
              setFormData({ ...formData, kitsuCoins: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
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

      {/* Liste des récompenses */}
      <div className="rewards-grid">
        {rewards.length === 0 ? (
          <p className="no-rewards">Aucune récompense disponible.</p>
        ) : (
          rewards.map((reward) => (
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
              <div className="reward-stats">
                <input
                  type="number"
                  value={reward.kitsuCoins}
                  onChange={(e) =>
                    handleEditReward(reward.id, "kitsuCoins", e.target.value)
                  }
                  className="reward-input-mini"
                />
                <input
                  type="number"
                  value={reward.stock}
                  onChange={(e) =>
                    handleEditReward(reward.id, "stock", e.target.value)
                  }
                  className="reward-input-mini"
                />
              </div>
              <div className="mission-buttons">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteReward(reward.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RewardIndividuel;
