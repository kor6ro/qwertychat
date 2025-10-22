import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  getDoc, 
  doc,
  Timestamp // Import Timestamp
} from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Camera, 
  Send 
} from 'lucide-react';

// Ambil user dari auth, bukan props
export default function ChatRoom({ isGroup = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatHeaderInfo, setChatHeaderInfo] = useState({ name: "Memuat...", status: "" });
  const [profilesCache, setProfilesCache] = useState(new Map()); // Cache untuk profil
  const messagesEndRef = useRef(null);
  
  const navigate = useNavigate();
  const { chatId, groupId } = useParams(); // Ambil ID dari URL
  const user = auth.currentUser; // Ambil user yang sedang login
  
  const currentChatId = isGroup ? groupId : chatId;
  const collectionPath = isGroup ? `groups/${currentChatId}` : `chats/${currentChatId}`;

  // 1. Logika untuk Header
  useEffect(() => {
    if (!currentChatId || !user) return;
    
    const chatDocRef = doc(db, collectionPath);

    const unsubscribe = onSnapshot(chatDocRef, async (chatSnap) => {
      if (!chatSnap.exists()) {
        navigate("/chat"); // Jika chat tidak ada, kembali
        return;
      }

      const chatData = chatSnap.data();

      if (isGroup) {
        setChatHeaderInfo({
          name: chatData.name,
          status: `${chatData.members?.length || 0} anggota`,
          avatar: chatData.avatar || chatData.name[0]
        });
      } else {
        // Ini chat 1-on-1
        // Cari ID user lawan bicara
        const otherUserId = chatData.members.find(uid => uid !== user.uid);
        if (otherUserId) {
          // Ambil profil lawan bicara
          const userDocRef = doc(db, 'users', otherUserId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setChatHeaderInfo({
              name: userData.displayName || userData.email,
              status: userData.status || "offline",
              avatar: userData.avatar || (userData.displayName || userData.email)[0]
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [currentChatId, user, isGroup, collectionPath, navigate]);


  // 2. PERBAIKAN PERFORMA: Mengambil Pesan
  useEffect(() => {
    if (!currentChatId) return;

    const messagesPath = `${collectionPath}/messages`;
    const q = query(collection(db, messagesPath), orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const msgs = [];
      const newProfilesToFetch = new Set();
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        msgs.push({ id: doc.id, ...data });
        // Cek apakah profil pengirim sudah ada di cache
        if (data.uid && !profilesCache.has(data.uid)) {
          newProfilesToFetch.add(data.uid);
        }
      });

      // Jika ada profil baru yang perlu diambil
      if (newProfilesToFetch.size > 0) {
        const newProfiles = new Map(profilesCache); // Salin cache lama
        
        // Ambil semua profil baru dalam satu batch
        const fetchPromises = Array.from(newProfilesToFetch).map(uid => 
          getDoc(doc(db, 'users', uid))
        );
        
        const profileDocs = await Promise.all(fetchPromises);
        
        profileDocs.forEach(docSnap => {
          if (docSnap.exists()) {
            newProfiles.set(docSnap.id, docSnap.data());
          }
        });
        
        setProfilesCache(newProfiles); // Update cache
      }

      setMessages(msgs); // Tampilkan pesan
    });

    return () => unsubscribe();
  }, [currentChatId, collectionPath, profilesCache]); // Tambahkan profilesCache


  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Kirim pesan
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !currentChatId) return;

    const messagesPath = `${collectionPath}/messages`;
    await addDoc(collection(db, messagesPath), {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: user.uid,
    });
    
    // Update 'lastMessage' di dokumen chat utamanya
    await setDoc(doc(db, collectionPath), {
      lastMessage: newMessage,
      lastMessageAt: serverTimestamp()
    }, { merge: true });

    setNewMessage('');
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  // Helper untuk format waktu
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '...';
    // Cek apakah ini 'Timestamp' Firestore atau 'Date'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* Header Dinamis */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex items-center gap-3 shadow-lg sticky top-0">
        <button 
          onClick={() => navigate(isGroup ? '/groups' : '/chat')} // Kembali ke list yang benar
          className="hover:bg-white/20 p-2 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
          {chatHeaderInfo.avatar?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{chatHeaderInfo.name}</h2>
          <p className="text-xs text-white/80">{chatHeaderInfo.status}</p>
        </div>
        <button className="hover:bg-white/20 p-2 rounded-full transition">
          <Phone className="w-5 h-5" />
        </button>
        <button className="hover:bg-white/20 p-2 rounded-full transition">
          <Video className="w-5 h-5" />
        </button>
        <button className="hover:bg-white/20 p-2 rounded-full transition">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>
      
      {/* Area Pesan (Dengan Profil dari Cache) */}
      <main className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="space-y-4">
          {messages.map(msg => {
            const senderProfile = profilesCache.get(msg.uid);
            const displayName = senderProfile?.displayName || "User";
            const isSentByMe = msg.uid === user.uid;

            return (
              <div key={msg.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${!isSentByMe && isGroup ? 'flex gap-2' : ''}`}>
                  {!isSentByMe && isGroup && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xs flex-shrink-0">
                      {displayName[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    {!isSentByMe && isGroup && (
                      <p className="text-xs text-gray-500 mb-1 ml-1">{displayName}</p>
                    )}
                    <div className={`p-3 rounded-2xl shadow-md ${
                      isSentByMe
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${isSentByMe ? 'text-white/70' : 'text-gray-400'}`}>
                        {formatTimestamp(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Footer Input */}
      <footer className="p-4 bg-white border-t sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <button type="button" className="hover:bg-gray-100 p-3 rounded-full transition">
            <Camera className="w-5 h-5 text-gray-600" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ketik pesan..."
          />
          <button 
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-full hover:shadow-lg transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}