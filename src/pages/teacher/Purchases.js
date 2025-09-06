// src/pages/teacher/Purchases.js
import React, { useEffect, useState } from "react";
import { db } from "../../Firebase";
import { collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore";
import "./Purchases.css"; // 🔹 Import du style global

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const purchasesRef = collection(db, "Purchases");
        const q = query(purchasesRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const purchasesList = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            // Récupérer le nom de l’étudiant
            const studentRef = doc(db, "Students", data.studentId);
            const studentSnap = await getDoc(studentRef);
            const studentName = studentSnap.exists()
              ? studentSnap.data().username
              : "Nom inconnu";

            // Récupérer le nom du produit
            const productRef = doc(db, "Products", data.productId);
            const productSnap = await getDoc(productRef);
            const productName = productSnap.exists()
              ? productSnap.data().name
              : "Produit inconnu";

            return {
              id: docSnap.id,
              studentName,
              productName,
              quantity: data.quantity,
              timestamp: data.timestamp,
            };
          })
        );

        setPurchases(purchasesList);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des achats :", error);
      }
    };

    fetchPurchases();
  }, []);

  if (loading) return <p className="loading">Chargement des achats...</p>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Suivi des achats des élèves</h2>

      {purchases.length === 0 ? (
        <p className="no-data">Aucun achat trouvé.</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td>{p.studentName}</td>
                <td>{p.productName}</td>
                <td>{p.quantity}</td>
                <td>{p.timestamp?.toDate().toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Purchases;
