import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { MoreVertical, User, Settings, LogOut } from 'lucide-react';

export default function TopBarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login'); // Arahkan ke login setelah logout
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-white/20 p-2 rounded-full transition"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop untuk menutup menu saat klik di luar */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Konten Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 text-gray-800 overflow-hidden">
            <button
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 transition"
            >
              <User className="w-4 h-4" />
              <span>Profil</span>
            </button>
            <button
              onClick={() => {
                navigate('/settings'); // Arahkan ke halaman settings baru
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 transition"
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
            <hr />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}