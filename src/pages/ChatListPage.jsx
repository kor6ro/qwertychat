// src/pages/ChatListPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react'; // Ganti Bell dengan Plus
import BottomNav from '../components/BottomNav';
import TopBarMenu from '../components/TopBarMenu'; // IMPORT MENU BARU
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDoc,
  where,
  orderBy
} from 'firebase/firestore';

export default function ChatListPage() {
  const [activeTab, setActiveTab] = useState('personal'); // State untuk tab
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header (Diganti ikonnya) */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 shadow-lg sticky top-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chats</h1>
          <div className="flex items-center gap-1">
            {/* Tombol Plus untuk chat/grup baru */}
            <button 
              onClick={() => navigate('/search')} // Arahkan ke halaman search untuk "Add"
              className="hover:bg-white/20 p-2 rounded-full transition"
            >
              <Plus className="w-5 h-5" />
            </button>
            {/* Ganti Bell dengan Menu Tiga Titik */}
            <TopBarMenu />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari chat..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Tabs (Grup sekarang di sini) */}
      <div className="flex border-b bg-white sticky top-[120px] z-10">
        <button 
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-3 font-semibold transition ${
            activeTab === 'personal'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Personal
        </button>
        <button
          onClick={() => setActiveTab('grup')}
          className={`flex-1 py-3 font-semibold transition ${
            activeTab === 'grup'
              ? 'text-blue-500 border-b-2 border-blue-500' // Samakan stylenya
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Grup
        </button>
      </div>

      {/* Konten List (Dinamis berdasarkan tab) */}
      <div className="flex-1 overflow-y-auto bg-white">
        {activeTab === 'personal' ? (
          <PersonalChatList currentUser={currentUser} searchQuery={searchQuery} />
        ) : (
          <GroupChatList currentUser={currentUser} searchQuery={searchQuery} />
        )}
      </div>

      <BottomNav />
    </div>
  );
}


// ===================================================================
// KOMPONEN BARU UNTUK LIST CHAT PERSONAL (LOGIKA BARU)
// ===================================================================
function PersonalChatList({ currentUser, searchQuery }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    // Query ke koleksi 'chats' yang melibatkan user ini
    const q = query(
      collection(db, 'chats'), 
      where('members', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc') // Urutkan berdasarkan pesan terakhir
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatsPromises = querySnapshot.docs.map(async (docSnap) => {
        const chatData = docSnap.data();
        const chatId = docSnap.id;

        // 1. Cari ID user lawan bicara
        const otherUserId = chatData.members.find(uid => uid !== currentUser.uid);
        if (!otherUserId) return null; // Skip jika ini chat aneh (misal: self-chat)

        // 2. Ambil profil lawan bicara
        const userDocRef = doc(db, 'users', otherUserId);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();
        
        return {
          id: chatId,
          ...chatData,
          otherUser: {
            id: otherUserId,
            name: userData?.displayName || userData?.email,
            avatar: userData?.displayName?.charAt(0) || userData?.email.charAt(0)
          }
        };
      });

      const chatsList = (await Promise.all(chatsPromises)).filter(Boolean); // Filter null
      setChats(chatsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Filter list berdasarkan searchQuery
  const filteredChats = chats.filter(chat => 
    chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="p-4 text-center text-gray-500">Memuat chat...</p>;
  if (filteredChats.length === 0) return <p className="p-4 text-center text-gray-500">Belum ada chat personal.</p>;

  return (
    <div>
      {filteredChats.map(chat => (
        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)} // Navigasi ke chat room
          className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-2xl shadow-md">
            {chat.otherUser.avatar.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold text-gray-800 truncate">{chat.otherUser.name}</h3>
              <span className="text-xs text-gray-500">
                {chat.lastMessageAt?.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{chat.lastMessage || "..."}</p>
          </div>
        </div>
      ))}
    </div>
  );
}


// ===================================================================
// KOMPONEN BARU UNTUK LIST GRUP (LOGIKA DARI GROUP LIST PAGE)
// ===================================================================
function GroupChatList({ currentUser, searchQuery }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    
    // Query ke koleksi 'groups' yang melibatkan user ini
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc') // Urutkan
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const groupsList = [];
      querySnapshot.forEach((doc) => {
        groupsList.push({ id: doc.id, ...doc.data() });
      });
      setGroups(groupsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Filter list berdasarkan searchQuery
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="p-4 text-center text-gray-500">Memuat grup...</p>;
  if (filteredGroups.length === 0) return <p className="p-4 text-center text-gray-500">Kamu belum bergabung dengan grup apapun.</p>;

  return (
    <div>
      {filteredGroups.map(group => (
        <div
          key={group.id}
          onClick={() => navigate(`/groups/${group.id}`)} // Navigasi ke chat grup
          className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl shadow-md">
            {group.avatar || group.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold text-gray-800 truncate">{group.name}</h3>
              <span className="text-xs text-gray-500">
                {group.lastMessageAt?.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{group.lastMessage || "..."}</p>
          </div>
        </div>
      ))}
    </div>
  );
}