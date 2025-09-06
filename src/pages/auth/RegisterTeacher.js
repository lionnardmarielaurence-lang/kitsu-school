import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from '../../Firebase';
import "./RegisterTeacher.css";

export default function RegisterTeacher() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;
      const token = Math.random().toString(36).substr(2, 8).toUpperCase();

      await setDoc(doc(db, "Teachers", uid), {
        firstName,
        lastName,
        email,
        token,
      });

      navigate("/teacher-dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Inscription professeur</h1>

      <input
        type="text"
        placeholder="Prénom"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Nom"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="error-message">{error}</p>}

      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Inscription..." : "S'inscrire"}
      </button>

      <div className="secondary-container">
        <button
          onClick={() => navigate("/")}
          className="secondary-button"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
