// src/pages/teacher/MissionDevoir.js
import React, { useState, useEffect } from 'react';
import { db } from '../../Firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import './MissionCreation.css';

export default function MissionDevoir() {
  const [missions, setMissions] = useState([]);
  const [formData, setFormData] = useState({
    titre: '',
    details: '',
    xp: '',
    mana: '',
    kitsuCoins: '',
    deadline: ''
  });

  // Récupération des missions depuis Firestore
  useEffect(() => {
    const fetchMissions = async () => {
      const querySnapshot = await getDocs(collection(db, 'missions'));
      const missionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMissions(missionsData);
    };
    fetchMissions();
  }, []);

  // Gestion du formulaire
  const handleChangeForm = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ajouter mission directement dans Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'missions'), {
        titre: formData.titre,
        details: formData.details || '',
        xp: Number(formData.xp) || 0,
        mana: Number(formData.mana) || 0,
        kitsuCoins: Number(formData.kitsuCoins) || 0,
        status: 'available',
        createdAt: serverTimestamp(),
        submittedAt: null,
        deadline: formData.deadline ? new Date(formData.deadline) : null
      });

      setMissions([...missions, { ...formData, id: docRef.id }]);
      setFormData({ titre: '', details: '', xp: '', mana: '', kitsuCoins: '', deadline: '' });
    } catch (error) {
      console.error('Erreur lors de l’ajout de la mission:', error);
    }
  };

  // Supprimer mission dans Firestore
  const handleDelete = async (index) => {
    const mission = missions[index];
    if (mission.id) {
      await deleteDoc(doc(db, 'missions', mission.id));
    }
    setMissions(missions.filter((_, i) => i !== index));
  };

  // Modifier mission Firestore directement
  const handleTableChange = async (index, field, value) => {
    const updatedMissions = [...missions];
    updatedMissions[index][field] = value;
    setMissions(updatedMissions);

    const mission = updatedMissions[index];
    if (mission.id) {
      const missionRef = doc(db, 'missions', mission.id);
      const updateValue = ['xp', 'mana', 'kitsuCoins'].includes(field) ? Number(value) : value;
      await updateDoc(missionRef, { [field]: updateValue });
    }
  };

  return (
    <div className="mission-hub">
      <div className="tab-content">
        {/* Formulaire */}
        <form className="mission-form" onSubmit={handleSubmit}>
          <input type="text" name="titre" placeholder="Titre" value={formData.titre} onChange={handleChangeForm} required />
          <textarea name="details" placeholder="Détails" value={formData.details} onChange={handleChangeForm} />
          <input type="number" name="xp" placeholder="XP" value={formData.xp} onChange={handleChangeForm} required />
          <input type="number" name="mana" placeholder="Mana" value={formData.mana} onChange={handleChangeForm} />
          <input type="number" name="kitsuCoins" placeholder="KitsuCoins" value={formData.kitsuCoins} onChange={handleChangeForm} />
          <input type="date" name="deadline" placeholder="Deadline" value={formData.deadline} onChange={handleChangeForm} />
          <div className="mission-buttons">
            <button type="submit" className="create-button">Ajouter Mission</button>
          </div>
        </form>

        {/* Tableau */}
        <div className="mission-table-container">
          <table className="mission-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Détails</th>
                <th>XP</th>
                <th>Mana</th>
                <th>KitsuCoins</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((mission, index) => (
                <tr key={mission.id || index}>
                  <td><input value={mission.titre} onChange={(e) => handleTableChange(index, 'titre', e.target.value)} /></td>
                  <td><textarea value={mission.details || ''} onChange={(e) => handleTableChange(index, 'details', e.target.value)} /></td>
                  <td><input type="number" value={mission.xp} onChange={(e) => handleTableChange(index, 'xp', e.target.value)} /></td>
                  <td><input type="number" value={mission.mana || 0} onChange={(e) => handleTableChange(index, 'mana', e.target.value)} /></td>
                  <td><input type="number" value={mission.kitsuCoins || 0} onChange={(e) => handleTableChange(index, 'kitsuCoins', e.target.value)} /></td>
                  <td>
                    <input
                      type="date"
                      value={mission.deadline ? new Date(mission.deadline.seconds ? mission.deadline.seconds * 1000 : mission.deadline).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleTableChange(index, 'deadline', e.target.value)}
                    />
                  </td>
                  <td className="action-buttons">
                    <button className="delete-button" onClick={() => handleDelete(index)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {missions.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty">Aucune mission enregistrée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
