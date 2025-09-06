import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages générales
import Home from './pages/Home';

// Pages auth
import LoginStudent from './pages/auth/LoginStudent';
import LoginTeacher from './pages/auth/LoginTeacher';
import RegisterStudent from './pages/auth/RegisterStudent';
import RegisterTeacher from './pages/auth/RegisterTeacher';

// Pages student
import SanctuaireDeMana from './pages/student/SanctuaireDeMana';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMessaging from './pages/student/StudentMessaging';
import StudentMission from './pages/student/StudentMission';
import StudentMissionCollective from './pages/student/StudentMissionCollective';
import StudentMissionDevoir from './pages/student/StudentMissionDevoir';
import StudentMissionIndividuelle from './pages/student/StudentMissionIndividuelle';
import StudentProfil from './pages/student/StudentProfil';
import StudentRewards from './pages/student/StudentRewards';

// Pages teacher
import Messaging from './pages/teacher/Messaging';
import MissionCollective from './pages/teacher/MissionCollective';
import MissionCreation from './pages/teacher/MissionCreation';
import MissionDevoir from './pages/teacher/MissionDevoir';
import MissionIndividuelle from './pages/teacher/MissionIndividuelle';
import MissionValidation from './pages/teacher/MissionValidation';
import MissionValidationCollective from './pages/teacher/MissionValidationCollective';
import MissionValidationDevoir from './pages/teacher/MissionValidationDevoir';
import MissionValidationIndividuelle from './pages/teacher/MissionValidationIndividuelle';
import Purchases from './pages/teacher/Purchases';
import RewardCollective from './pages/teacher/RewardCollective';
import RewardIndividuel from './pages/teacher/RewardIndividuel';
import RewardManagement from './pages/teacher/RewardManagement';
import StudentManagement from './pages/teacher/StudentManagement';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfil from './pages/teacher/TeacherProfil';

function App() {
  // Route protégée pour élèves avec session locale
  const StudentRoute = ({ children }) => {
    const loggedUser = localStorage.getItem("currentStudent");
    if (!loggedUser) return <Navigate to="/login-student" />;
    return children;
  };

  // Route protégée pour profs (garde Firebase Auth si tu veux)
  const TeacherRoute = ({ children }) => {
    const loggedTeacher = localStorage.getItem("currentTeacher");
    if (!loggedTeacher) return <Navigate to="/login-teacher" />;
    return children;
  };

  return (
    <Routes>
      {/* Pages générales */}
      <Route path="/" element={<Home />} />

      {/* Auth */}
      <Route path="/login-student" element={<LoginStudent />} />
      <Route path="/login-teacher" element={<LoginTeacher />} />
      <Route path="/register-student" element={<RegisterStudent />} />
      <Route path="/register-teacher" element={<RegisterTeacher />} />

      {/* Student routes */}
      <Route path="/student/sanctuaire" element={<StudentRoute><SanctuaireDeMana /></StudentRoute>} />
      <Route path="/student-dashboard/:username" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
      <Route path="/student-messaging" element={<StudentRoute><StudentMessaging /></StudentRoute>} />
      <Route path="/student-mission" element={<StudentRoute><StudentMission /></StudentRoute>} />
      <Route path="/student-mission-collective" element={<StudentRoute><StudentMissionCollective /></StudentRoute>} />
      <Route path="/student-mission-devoir" element={<StudentRoute><StudentMissionDevoir /></StudentRoute>} />
      <Route path="/student-mission-individuelle" element={<StudentRoute><StudentMissionIndividuelle /></StudentRoute>} />
      <Route path="/student-profil" element={<StudentRoute><StudentProfil /></StudentRoute>} />
      <Route path="/student-rewards" element={<StudentRoute><StudentRewards /></StudentRoute>} />

      {/* Teacher routes */}
      <Route path="/teacher-dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
      <Route path="/teacher-profil" element={<TeacherRoute><TeacherProfil /></TeacherRoute>} />
      <Route path="/teacher-messaging" element={<TeacherRoute><Messaging /></TeacherRoute>} />
      <Route path="/teacher-mission-collective" element={<TeacherRoute><MissionCollective /></TeacherRoute>} />
      <Route path="/teacher-mission-creation" element={<TeacherRoute><MissionCreation /></TeacherRoute>} />
      <Route path="/teacher-mission-devoir" element={<TeacherRoute><MissionDevoir /></TeacherRoute>} />
      <Route path="/teacher-mission-individuelle" element={<TeacherRoute><MissionIndividuelle /></TeacherRoute>} />
      <Route path="/teacher-mission-validation" element={<TeacherRoute><MissionValidation /></TeacherRoute>} />
      <Route path="/teacher-mission-validation-collective" element={<TeacherRoute><MissionValidationCollective /></TeacherRoute>} />
      <Route path="/teacher-mission-validation-devoir" element={<TeacherRoute><MissionValidationDevoir /></TeacherRoute>} />
      <Route path="/teacher-mission-validation-individuelle" element={<TeacherRoute><MissionValidationIndividuelle /></TeacherRoute>} />
      <Route path="/teacher-purchases" element={<TeacherRoute><Purchases /></TeacherRoute>} />
      <Route path="/teacher-reward-collective" element={<TeacherRoute><RewardCollective /></TeacherRoute>} />
      <Route path="/teacher-reward-individuel" element={<TeacherRoute><RewardIndividuel /></TeacherRoute>} />
      <Route path="/teacher-reward-management" element={<TeacherRoute><RewardManagement /></TeacherRoute>} />
      <Route path="/teacher-student-management" element={<TeacherRoute><StudentManagement /></TeacherRoute>} />
    </Routes>
  );
}

export default App;
