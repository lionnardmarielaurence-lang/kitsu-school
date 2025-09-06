import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../Firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import './StudentMessaging.css';

const StudentMessaging = () => {
  const { username } = useParams(); // pseudo/uid de l'élève
  const currentUserId = username;

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userNames, setUserNames] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔹 Charger toutes les conversations
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "Chats"),
      where("participants", "array-contains", currentUserId)
    );

    const unsubscribe = onSnapshot(q, async snapshot => {
      const chatList = await Promise.all(snapshot.docs.map(async docSnap => {
        const data = docSnap.data();
        const otherParticipants = data.participants.filter(p => p !== currentUserId);

        const names = await Promise.all(otherParticipants.map(async uid => {
          if (userNames[uid]) return userNames[uid];
          const userDoc = await getDoc(doc(db, "Teachers", uid));
          if (userDoc.exists()) {
            const fullName = `${userDoc.data().firstName} ${userDoc.data().lastName}`;
            setUserNames(prev => ({ ...prev, [uid]: fullName }));
            return fullName;
          }
          return uid;
        }));

        return { id: docSnap.id, ...data, otherParticipants: names };
      }));
      setChats(chatList);
    });

    return () => unsubscribe();
  }, [currentUserId, userNames]);

  // 🔹 Charger les messages
  useEffect(() => {
    if (!currentUserId || !selectedChatId) return;

    const q = query(
      collection(db, "Chats", selectedChatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [currentUserId, selectedChatId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId) return;
    const chat = chats.find(c => c.id === selectedChatId);
    const receiverId = chat.participants.find(p => p !== currentUserId);

    await addDoc(collection(db, "Chats", selectedChatId, "messages"), {
      senderId: currentUserId,
      receiverId,
      content: newMessage,
      timestamp: serverTimestamp(),
      read: false
    });

    setNewMessage("");
  };

  return (
    <div className="messaging-wrapper">
      {/* Sidebar */}
      <div className="messaging-sidebar">
        <h3>Mes conversations</h3>

        <div className="chat-list">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`messaging-chat-item ${selectedChatId === chat.id ? "active" : ""}`}
              onClick={() => setSelectedChatId(chat.id)}
            >
              {chat.otherParticipants.join(", ")}
            </div>
          ))}
        </div>

        <button className="messaging-new-chat-btn">Nouvelle conversation</button>
      </div>

      {/* Chat area */}
      <div className="messaging-chat">
        {selectedChatId ? (
          <>
            <div className="messages-list">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`message-row ${msg.senderId === currentUserId ? "sent" : "received"}`}
                >
                  <div className="message-bubble">
                    <strong>{msg.senderId === currentUserId ? "Moi" : userNames[msg.senderId] || msg.senderId}:</strong> {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
            <div className="message-input-area">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Écrire un message..."
                onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
              />
              <button className="send-btn" onClick={sendMessage}>Envoyer</button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            Sélectionnez une conversation pour commencer à discuter.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMessaging;
