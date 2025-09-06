// src/pages/teacher/MissionIndividuelle.js
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

export default function MissionIndividuelle() {
  const [students, setStudents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    titre: '',
    details: '',
    xp: '',
    mana: '',
    kitsuCoins: '',
    deadline: '' // <-- ajout du champ date
  });
  const [message, setMessage] = useState('');

  // Récupérer étudiants et missions individuelles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsSnap = await getDocs(collection(db, 'Students'));
        setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const missionsSnap = await getDocs(collection(db, 'missionsIndividuelles'));
        setMissions(missionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error(error);
        setMessage('❌ Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, []);

  // Gestion formulaire
  const handleChangeForm = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.studentId || !formData.titre) {
      setMessage('⚠️ Complétez l’élève et le titre');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'missionsIndividuelles'), {
        studentId: formData.studentId,
        titre: formData.titre,
        details: formData.details || '',
        xp: Number(formData.xp) || 0,
        mana: Number(formData.mana) || 0,
        kitsuCoins: Number(formData.kitsuCoins) || 0,
        deadline: formData.deadline || null, // <-- facultatif
        status: 'En cours',
        createdAt: serverTimestamp()
      });

      setMissions([
        ...missions,
        { ...formData, id: docRef.id, status: 'En cours' }
      ]);
      setFormData({
        studentId: '',
        titre: '',
        details: '',
        xp: '',
        mana: '',
        kitsuCoins: '',
        deadline: ''
      });
      setMessage('✅ Mission ajoutée !');
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de l’ajout de la mission');
    }
  };

  // Supprimer mission
  const handleDelete = async index => {
    const mission = missions[index];
    if (mission.id) {
      await deleteDoc(doc(db, 'missionsIndividuelles', mission.id));
      setMissions(missions.filter((_, i) => i !== index));
      setMessage('Mission supprimée ✅');
    }
  };

  // Modifier mission
  const handleTableChange = async (index, field, value) => {
    const updatedMissions = [...missions];
    updatedMissions[index][field] = ['xp', 'mana', 'kitsuCoins'].includes(field)
      ? Number(value)
      : value;
    setMissions(updatedMissions);

    const mission = updatedMissions[index];
    if (mission.id) {
      await updateDoc(doc(db, 'missionsIndividuelles', mission.id), {
        [field]: mission[field]
      });
    }
  };

  return (
    <div className="mission-hub">
      {message && <p className="message">{message}</p>}

      <div className="tab-content">
        {/* Formulaire */}
        <form className="mission-form" onSubmit={handleSubmit}>
          <select
            name="studentId"
            value={formData.studentId}
            onChange={handleChangeForm}
            required
          >
            <option value="">-- Choisir un étudiant --</option>
            {students.map(s => (
              <option key={s.id} value={s.username}>
                {s.firstName} {s.lastName} ({s.username})
              </option>
            ))}
          </select>

          <input
            type="text"
            name="titre"
            placeholder="Titre"
            value={formData.titre}
            onChange={handleChangeForm}
            required
          />
          <textarea
            name="details"
            placeholder="Détails"
            value={formData.details}
            onChange={handleChangeForm}
          />
          <input
            type="number"
            name="xp"
            placeholder="XP"
            value={formData.xp}
            onChange={handleChangeForm}
          />
          <input
            type="number"
            name="mana"
            placeholder="Mana"
            value={formData.mana}
            onChange={handleChangeForm}
          />
          <input
            type="number"
            name="kitsuCoins"
            placeholder="KitsuCoins"
            value={formData.kitsuCoins}
            onChange={handleChangeForm}
          />

          {/* Nouveau champ facultatif */}
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChangeForm}
          />

          <div className="mission-buttons">
            <button type="submit" className="create-button">
              Ajouter Mission
            </button>
          </div>
        </form>

        {/* Tableau */}
        <div className="mission-table-container">
          <table className="mission-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Titre</th>
                <th>Détails</th>
                <th>XP</th>
                <th>Mana</th>
                <th>KitsuCoins</th>
                <th>Date butoir</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {missions.length === 0 && (
                <tr>
                  <td colSpan="9" className="empty">
                    Aucune mission enregistrée
                  </td>
                </tr>
              )}
              {missions.map((mission, index) => {
                const student = students.find(
                  s => s.username === mission.studentId
                );
                return (
                  <tr key={mission.id || index}>
                    <td>
                      {student
                        ? `${student.firstName} ${student.lastName}`
                        : 'Inconnu'}
                    </td>
                    <td>
                      <input
                        value={mission.titre}
                        onChange={e =>
                          handleTableChange(index, 'titre', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <textarea
                        value={mission.details || ''}
                        onChange={e =>
                          handleTableChange(index, 'details', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={mission.xp}
                        onChange={e =>
                          handleTableChange(index, 'xp', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={mission.mana || 0}
                        onChange={e =>
                          handleTableChange(index, 'mana', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={mission.kitsuCoins || 0}
                        onChange={e =>
                          handleTableChange(index, 'kitsuCoins', e.target.value)
                        }
                      />
                    </td>
                    {/* Affichage + modification de la date butoir */}
                    <td>
                      <input
                        type="date"
                        value={mission.deadline || ''}
                        onChange={e =>
                          handleTableChange(index, 'deadline', e.target.value)
                        }
                      />
                    </td>
                    <td>{mission.status}</td>
                    <td className="action-buttons">
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(index)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
