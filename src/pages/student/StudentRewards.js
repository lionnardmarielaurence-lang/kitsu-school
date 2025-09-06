import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/config"; 
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  runTransaction,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import './StudentRewards.css';

const StudentRewards = () => {
  const { username } = useParams();
  const normalizedUsername = username.toLowerCase();

  const [rewards, setRewards] = useState([]);
  const [student, setStudent] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentAndRewards = async () => {
      try {
        const studentRef = doc(db, "Students", normalizedUsername);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
          alert("Étudiant non trouvé !");
          setLoading(false);
          return;
        }

        setStudent({ id: normalizedUsername, ...studentSnap.data() });

        const rewardsCollection = collection(db, "Products");
        const rewardsSnapshot = await getDocs(rewardsCollection);
        const rewardsList = rewardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRewards(rewardsList);

        const purchasesQuery = query(
          collection(db, "Purchases"),
          where("studentId", "==", normalizedUsername)
        );
        const purchasesSnapshot = await getDocs(purchasesQuery);
        const purchasesList = purchasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPurchaseHistory(purchasesList);

        setLoading(false);
      } catch (error) {
        console.error("Erreur :", error);
        setLoading(false);
      }
    };

    fetchStudentAndRewards();
  }, [normalizedUsername]);

  const handlePurchase = async (reward) => {
    if (!student) return;

    const studentRef = doc(db, "Students", student.id);
    const rewardRef = doc(db, "Products", reward.id);

    try {
      await runTransaction(db, async (transaction) => {
        const studentDoc = await transaction.get(studentRef);
        const rewardDoc = await transaction.get(rewardRef);

        if (!studentDoc.exists()) throw new Error("Étudiant non trouvé !");
        if (!rewardDoc.exists()) throw new Error("Produit non trouvé !");

        const studentCoins = Number(studentDoc.data().kitsuCoins);
        const rewardStock = rewardDoc.data().stock;
        const rewardPrice = rewardDoc.data().kitsuCoins; 
        const rewardName = rewardDoc.data().title;       

        if (!rewardName) throw new Error("Le produit n'a pas de nom défini !");
        if (studentCoins < rewardPrice) throw new Error("Pas assez de KitsuCoins !");
        if (rewardStock <= 0) throw new Error("Produit en rupture de stock !");

        transaction.update(studentRef, { kitsuCoins: studentCoins - rewardPrice });
        transaction.update(rewardRef, { stock: rewardStock - 1 });

        const purchaseRef = doc(collection(db, "Purchases"));
        transaction.set(purchaseRef, {
          studentId: student.id,
          productId: reward.id,
          productName: rewardName,
          price: rewardPrice,
          quantity: 1,
          timestamp: serverTimestamp()
        });

        setStudent(prev => ({ ...prev, kitsuCoins: studentCoins - rewardPrice }));
        setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, stock: rewardStock - 1 } : r));
        setPurchaseHistory(prev => [
          ...prev,
          { id: purchaseRef.id, studentId: student.id, productId: reward.id, productName: rewardName, price: rewardPrice, quantity: 1, timestamp: new Date() }
        ]);
      });

      alert(`Vous avez acheté : ${reward.title} pour ${reward.kitsuCoins} KitsuCoins !`);
    } catch (error) {
      alert(error.message);
      console.error("Erreur lors de l'achat :", error);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="student-rewards">
      <h2>Récompenses disponibles</h2>
      <p>KitsuCoins : {student?.kitsuCoins}</p>

      <div className="rewards-grid">
        {rewards.map(reward => (
          <div key={reward.id} className="reward-card">
            <h3>{reward.title}</h3>
            <p>Prix : {reward.kitsuCoins} KitsuCoins</p>
            <p>Stock : {reward.stock}</p>
            <button onClick={() => handlePurchase(reward)} disabled={reward.stock <= 0}>
              {reward.stock > 0 ? "Acheter" : "Rupture de stock"}
            </button>
          </div>
        ))}
      </div>

      <h3>Historique des achats</h3>
      {purchaseHistory.length === 0 ? (
        <p className="no-rewards">Aucun achat pour le moment.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Produit</th>
              <th>Prix</th>
              <th>Quantité</th>
            </tr>
          </thead>
          <tbody>
            {purchaseHistory.map(p => (
              <tr key={p.id}>
                <td>
                  {p.timestamp && p.timestamp.toDate
                    ? p.timestamp.toDate().toLocaleString()
                    : new Date(p.timestamp).toLocaleString()}
                </td>
                <td>{p.productName}</td>
                <td>{p.price}</td>
                <td>{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentRewards;
