// src/pages/teacher/StudentManagement.js
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../Firebase";
import { useNavigate } from "react-router-dom";
import "./StudentManagement.css";

const StudentManagement = () => {
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Vérification de l'utilisateur connecté
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate("/login-teacher");
      } else {
        setTeacher(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Récupération des étudiants
  const fetchStudents = async () => {
    if (!teacher) return;
    setLoadingStudents(true);

    try {
      const q = query(
        collection(db, "Students"),
        where("teacherId", "==", teacher.uid)
      );
      const snapshot = await getDocs(q);
      const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des étudiants:", error);
    }

    setLoadingStudents(false);
  };

  useEffect(() => {
    if (teacher) fetchStudents();
    document.title = "Gestion des élèves";
  }, [teacher]);

  // Supprimer un élève
  const deleteStudent = async (studentId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élève ?")) return;
    try {
      await deleteDoc(doc(db, "Students", studentId));
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'élève:", error);
    }
  };

  // Supprimer tous les élèves
  const deleteAllStudents = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer TOUS les élèves de votre classe ?")) return;
    try {
      const q = query(
        collection(db, "Students"),
        where("teacherId", "==", teacher.uid)
      );
      const snapshot = await getDocs(q);
      const batchDeletes = snapshot.docs.map(docRef => deleteDoc(doc(db, "Students", docRef.id)));
      await Promise.all(batchDeletes);
      setStudents([]);
    } catch (error) {
      console.error("Erreur lors de la suppression de tous les élèves:", error);
    }
  };

  if (loading || loadingStudents) return <p className="loading">Chargement...</p>;

  return (
    <div className="student-management-container">
      <h2 className="student-management-title">Gestion des élèves</h2>

      <button className="btn btn-danger" onClick={deleteAllStudents}>
        Supprimer tous les élèves
      </button>

      {students.length === 0 ? (
        <p className="no-students">Aucun étudiant enregistré pour ce professeur.</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>XP</th>
              <th>Mana</th>
              <th>KitsuCoins</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.username}</td>
                <td>{student.xp || 0}</td>
                <td>{student.mana || 0}</td>
                <td>{student.kitsuCoins || 0}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => deleteStudent(student.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentManagement;
