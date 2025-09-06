import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  query,
  where,
  getDocs,
  serverTimestamp,
  getDoc,
  runTransaction
} from "firebase/firestore";
import './Sanctuary.css';

const MAX_DAILY_MANA = 60; // Limite quotidienne augmentée

const SanctuaryCollective = () => {
  const { username } = useParams();
  const normalizedUsername = username?.toLowerCase();

  const [student, setStudent] = useState(null);
  const [rewards, setRewards] = useState([]);

  // Récupération du profil élève
  useEffect(() => {
    const fetchStudent = async () => {
      if (!normalizedUsername) return;
      const studentRef = doc(db, "Students", normalizedUsername);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        setStudent({ id: normalizedUsername, ...studentSnap.data() });
      }
    };
    fetchStudent();
  }, [normalizedUsername]);

  // Écoute temps réel de CollectiveRewards
  useEffect(() => {
    const rewardsRef = collection(db, "CollectiveRewards");
    const unsubscribe = onSnapshot(rewardsRef, snapshot => {
      const rewardsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRewards(rewardsList);
    });
    return () => unsubscribe();
  }, []);

  // Dépôt de mana sécurisé, avec possibilité de déposer plusieurs points
  const depositMana = async (reward, amount = 1) => {
    if (!reward?.id || !student?.id) return;

    const rewardRef = doc(db, "CollectiveRewards", reward.id);
    const studentRef = doc(db, "Students", student.id);
    const today = new Date().toISOString().slice(0, 10);

    try {
      await runTransaction(db, async (transaction) => {
        const studentSnap = await transaction.get(studentRef);
        const rewardSnap = await transaction.get(rewardRef);

        if (!studentSnap.exists() || !rewardSnap.exists()) {
          throw new Error("student-or-reward-not-found");
        }

        const studentData = studentSnap.data();
        const rewardData = rewardSnap.data();

        // Vérifie que l'élève a assez de mana
        if ((studentData.mana || 0) < amount) {
          throw new Error("not-enough-mana");
        }

        // Vérifie le total de mana déjà déposé aujourd'hui pour cette récompense
        const depositsQuery = query(
          collection(db, "ManaDeposits"),
          where("studentId", "==", student.id),
          where("rewardId", "==", reward.id),
          where("date", "==", today)
        );

        const snapshot = await getDocs(depositsQuery);
        const alreadyDeposited = snapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

        if (alreadyDeposited + amount > MAX_DAILY_MANA) {
          throw new Error("daily-limit-reached");
        }

        // Ajouter le dépôt
        const depositRef = doc(collection(db, "ManaDeposits"));
        transaction.set(depositRef, {
          studentId: student.id,
          rewardId: reward.id,
          amount,
          date: today,
          timestamp: serverTimestamp()
        });

        // Décrémente la mana de l'élève
        transaction.update(studentRef, { mana: increment(-amount) });

        // Met à jour la progression de la récompense
        const willUnlock = (rewardData.progress || 0) + amount >= (rewardData.mana || 0);
        transaction.update(rewardRef, {
          progress: increment(amount),
          isUnlocked: willUnlock
        });
      });

      // Mise à jour locale (optimiste)
      setStudent(prev => ({ ...prev, mana: (prev.mana || 0) - amount }));

    } catch (error) {
      console.error("Erreur dépôt mana :", error);

      if (error.message === "not-enough-mana") {
        alert("Vous n'avez pas assez de mana !");
      } else if (error.message === "daily-limit-reached") {
        alert(`Vous avez déjà atteint ${MAX_DAILY_MANA} points de mana aujourd'hui !`);
      } else if (error.message === "student-or-reward-not-found") {
        alert("Élève ou récompense introuvable.");
      } else if (error.code === "permission-denied") {
        alert("Permission refusée — vérifie les règles Firestore.");
      } else {
        alert("Impossible de déposer la mana pour le moment. Voir console pour détails.");
      }
    }
  };

  if (!student) return <p>Chargement du profil...</p>;

  return (
    <div className="sanctuary">
      <h2>Sanctuaire de Mana - {student.firstName}</h2>
      <div className="rewards-container">
        {rewards.map(reward => {
          const progressPercent = Math.min((reward.progress / reward.mana) * 100, 100);

          return (
            <div key={reward.id} className="mana-reward-card">
              <h3>{reward.title}</h3>
              <p>{reward.details}</p>

              <div className="thermometer">
                <div
                  className="thermometer-fill"
                  style={{ height: `${progressPercent}%` }}
                />
              </div>
              <p>{reward.progress} / {reward.mana} Mana</p>

              <button
                onClick={() => depositMana(reward, 1)}
                disabled={reward.isUnlocked}
              >
                Déposer 1 Mana
              </button>

              <button
                onClick={() => depositMana(reward, 10)}
                disabled={reward.isUnlocked}
              >
                Déposer 10 Mana
              </button>

              {reward.isUnlocked && <p className="unlocked">Récompense débloquée ! 🎉</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SanctuaryCollective;
