import { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { auth } from '../firebaseConfig';


export default function ChatRoom({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Ambil profil pengguna saat ini
    const fetchUserProfile = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setCurrentUserProfile(userDocSnap.data());
      }
    };
    fetchUserProfile();

    // Dengarkan (subscribe) pesan baru secara real-time
    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const msgs = [];
      // Looping untuk setiap pesan dan ambil data pengirimnya
      for (const docSnap of querySnapshot.docs) {
          const messageData = docSnap.data();
          let senderName = 'Unknown User';
          if(messageData.uid) {
            const senderDocRef = doc(db, 'users', messageData.uid);
            const senderDocSnap = await getDoc(senderDocRef);
            senderName = senderDocSnap.exists() ? senderDocSnap.data().displayName : 'Unknown User';
          }
          msgs.push({ id: docSnap.id, ...messageData, displayName: senderName });
      }
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user]);

  // Auto-scroll ke pesan paling bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUserProfile) return;

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: user.uid,
    });
    setNewMessage('');
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between p-4 bg-gray-800 shadow-md">
        <h1 className="text-xl font-bold">Qwerty Chat</h1>
        <div className='flex items-center gap-4'>
          <span>Hi, {currentUserProfile?.displayName || user.email}</span>
          <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold bg-red-600 rounded-md hover:bg-red-700 transition">
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.uid === user.uid ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.uid === user.uid ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <p className="text-xs text-gray-300 font-bold">{msg.displayName}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button type="submit" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition">
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}