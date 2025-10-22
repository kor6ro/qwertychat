import { useParams } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom'; // Import komponen ChatRoom Anda
import { auth } from '../firebaseConfig';

export default function ChatRoomPage({ isGroup = false }) {
  const { chatId, groupId } = useParams();
  const id = isGroup ? groupId : chatId;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  // Kita teruskan 'user' dan 'chatId' ke komponen ChatRoom Anda
  return (
    <ChatRoom 
      user={currentUser} 
      chatId={id} // Anda perlu modifikasi ChatRoom.jsx untuk menerima ini
      isGroup={isGroup} 
    />
  );
}