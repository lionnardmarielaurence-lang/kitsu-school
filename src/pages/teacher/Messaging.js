import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../../Firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import "./Messaging.css";

const TeacherMessaging = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [students, setStudents] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [selectedStudentUid, setSelectedStudentUid] = useState("");
  const messagesEndRef = useRef(null);

  // 🔹 Utilisateur connecté
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUserId(user.uid);
      else setCurrentUserId(null);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Charger les élèves liés au prof
  useEffect(() => {
    if (!currentUserId) return;

    const fetchStudents = async () => {
      const studentsQuery = query(
        collection(db, "Students"),
        where("teacherId", "==", currentUserId)
      );
      const snapshot = await getDocs(studentsQuery);
      const list = snapshot.docs.map(doc => ({
        username: doc.data().username
      }));
      setStudents(list);

      const map = {};
      list.forEach(s => { map[s.username] = s.username; });
      setUserNames(map);
    };

    fetchStudents();
  }, [currentUserId]);

  // 🔹 Charger toutes les conversations
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "Chats"),
      where("participants", "array-contains", currentUserId)
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const chatList = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setChats(chatList);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // 🔹 Charger les messages d’un chat
  useEffect(() => {
    if (!currentUserId || !selectedChatId) return;

    const q = query(
      collection(db, "Chats", selectedChatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [currentUserId, selectedChatId]);

  // 🔹 Envoyer un message 1-à-1 (fonction existante inchangée)
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId) return;

    const chat = chats.find(c => c.id === selectedChatId);
    const receiverId = chat.participants.find(p => p !== currentUserId);

    await addDoc(collection(db, "Chats", selectedChatId, "messages"), {
      senderId: currentUserId,
      receiverId,
      content: newMessage,
      timestamp: serverTimestamp(),
      read: false,
    });

    setNewMessage("");
  };

  // 🔹 Envoyer le même message à tous les élèves (1-à-1)
  const sendMessageToAll = async () => {
    if (!newMessage.trim() || students.length === 0) return;

    for (let s of students) {
      const studentUsername = s.username;

      // Vérifie si un chat 1-à-1 existe déjà avec cet élève
      let chat = chats.find(c => c.participants.includes(studentUsername));

      if (!chat) {
        // Crée un nouveau chat si aucun chat existant
        const docRef = await addDoc(collection(db, "Chats"), {
          participants: [currentUserId, studentUsername],
          createdAt: serverTimestamp()
        });
        chat = { id: docRef.id, participants: [currentUserId, studentUsername] };
        setChats(prev => [...prev, chat]);
      }

      // Ajoute le message dans le chat 1-à-1
      await addDoc(collection(db, "Chats", chat.id, "messages"), {
        senderId: currentUserId,
        receiverId: studentUsername,
        content: newMessage,
        timestamp: serverTimestamp(),
        read: false,
      });
    }

    setNewMessage("");
  };

  if (!currentUserId) return <p>Vous devez être connecté.</p>;

  return (
    <div className="teacher-msg-wrapper">
      {/* Sidebar */}
      <div className="teacher-msg-sidebar">
        <h3>Conversations</h3>

        <select
          value={selectedStudentUid}
          onChange={e => setSelectedStudentUid(e.target.value)}
        >
          <option value="">Sélectionnez un élève...</option>
          {students.map(s => (
            <option key={s.username} value={s.username}>{s.username}</option>
          ))}
        </select>

        <button
          className="teacher-msg-new-btn"
          onClick={async () => {
            if (!selectedStudentUid) return;

            let existingChat = chats.find(c =>
              c.participants.includes(selectedStudentUid)
            );

            if (existingChat) {
              setSelectedChatId(existingChat.id);
              return;
            }

            const docRef = await addDoc(collection(db, "Chats"), {
              participants: [currentUserId, selectedStudentUid],
              createdAt: serverTimestamp()
            });

            setSelectedChatId(docRef.id);
            setSelectedStudentUid("");
          }}
        >
          Nouvelle conversation
        </button>

        <div className="teacher-msg-list">
          {chats.map(chat => {
            const other = chat.participants.find(p => p !== currentUserId);
            const name = userNames[other] || other;
            return (
              <div
                key={chat.id}
                className={`teacher-msg-item ${selectedChatId === chat.id ? "active" : ""}`}
                onClick={() => setSelectedChatId(chat.id)}
              >
                {name}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="teacher-msg-chat">
        {selectedChatId ? (
          <>
            <div className="teacher-msg-messages">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`teacher-msg-row ${msg.senderId === currentUserId ? "sent" : "received"}`}
                >
                  <div className="teacher-msg-bubble">
                    <strong>{msg.senderId === currentUserId ? "Moi" : userNames[msg.senderId]}</strong>: {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="teacher-msg-input-area">
              <input
                type="text"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if(e.key === "Enter") sendMessage(); }}
              />
              <button className="teacher-msg-send-btn" onClick={sendMessage}>Envoyer</button>
              <button className="teacher-msg-send-all-btn" onClick={sendMessageToAll}>Envoyer à tous</button>
            </div>
          </>
        ) : (
          <div className="teacher-msg-no-chat">
            Sélectionnez un élève pour commencer à discuter.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMessaging;
