// src/pages/teacher/MissionCollective.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './MissionCreation.css';

export default function MissionCollective() {
  const [missions, setMissions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    xp: '',
    mana: '',
    kitsuCoins: '',
  });

  // Récupération des missions
  const fetchMissions = async () => {
    try {
      const q = query(collection(db, 'missionsCollectives'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMissions(data);
    } catch (error) {
      console.error('Erreur fetch missions :', error);
    }
  };

  useEffect(() => { fetchMissions(); }, []);

  // Création d'une mission
  const handleCreateMission = async () => {
    const { title, details, xp, mana, kitsuCoins } = formData;
    if (!title || !details) return alert('Titre et détails requis');
    try {
      await addDoc(collection(db, 'missionsCollectives'), {
        title,
        details,
        xp: Number(xp),
        mana: Number(mana),
        kitsuCoins: Number(kitsuCoins),
        createdAt: new Date(),
      });
      setFormData({ title: '', details: '', xp: '', mana: '', kitsuCoins: '' });
      fetchMissions();
    } catch (error) {
      console.error('Erreur création mission :', error);
    }
  };

  // Suppression d'une mission
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette mission ?')) return;
    try {
      await deleteDoc(doc(db, 'missionsCollectives', id));
      fetchMissions();
    } catch (error) {
      console.error('Erreur suppression mission :', error);
    }
  };

  // Mise à jour d'une mission
  const handleUpdate = async (id, field, value) => {
    try {
      await updateDoc(doc(db, 'missionsCollectives', id), { [field]: field === 'title' || field === 'details' ? value : Number(value) });
      fetchMissions();
    } catch (error) {
      console.error('Erreur mise à jour mission :', error);
    }
  };

  return (
    <div className="mission-hub">
      {/* Formulaire création */}
      <div className="mission-card">
        <h2>Créer une Mission Collective</h2>
        <div className="mission-form">
          <input
            type="text"
            placeholder="Titre"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
          <textarea
            placeholder="Détails"
            value={formData.details}
            onChange={e => setFormData({ ...formData, details: e.target.value })}
          />
          <input
            type="number"
            placeholder="XP"
            value={formData.xp}
            onChange={e => setFormData({ ...formData, xp: e.target.value })}
          />
          <input
            type="number"
            placeholder="Mana"
            value={formData.mana}
            onChange={e => setFormData({ ...formData, mana: e.target.value })}
          />
          <input
            type="number"
            placeholder="KitsuCoins"
            value={formData.kitsuCoins}
            onChange={e => setFormData({ ...formData, kitsuCoins: e.target.value })}
          />
        </div>
        <div className="mission-buttons">
          <button className="create-button" onClick={handleCreateMission}>Créer Mission</button>
        </div>
      </div>

      {/* Tableau des missions */}
      <div className="mission-table-container">
        <table className="mission-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Détails</th>
              <th>XP</th>
              <th>Mana</th>
              <th>KitsuCoins</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {missions.map(m => (
              <tr key={m.id}>
                <td>
                  <input
                    value={m.title}
                    onChange={e => handleUpdate(m.id, 'title', e.target.value)}
                  />
                </td>
                <td>
                  <textarea
                    value={m.details}
                    onChange={e => handleUpdate(m.id, 'details', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={m.xp}
                    onChange={e => handleUpdate(m.id, 'xp', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={m.mana}
                    onChange={e => handleUpdate(m.id, 'mana', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={m.kitsuCoins}
                    onChange={e => handleUpdate(m.id, 'kitsuCoins', e.target.value)}
                  />
                </td>
                <td className="action-buttons">
                  <button className="delete-button" onClick={() => handleDelete(m.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
