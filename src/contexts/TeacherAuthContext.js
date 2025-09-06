import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase";

const TeacherAuthContext = createContext();

export function useTeacherAuth() {
  return useContext(TeacherAuthContext);
}

export function TeacherAuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTeacher(user);
      } else {
        setTeacher(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <TeacherAuthContext.Provider value={{ teacher, loading }}>
      {children}  {/* Toujours rendre les enfants pour que le dashboard puisse gérer le loading */}
    </TeacherAuthContext.Provider>
  );
}
