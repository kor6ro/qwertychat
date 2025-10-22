import { NavLink } from 'react-router-dom';
import { MessageCircle, Users, Search, User } from 'lucide-react';

// Helper function untuk styling link yang aktif
const getNavLinkClass = ({ isActive }) =>
  `flex-1 py-4 flex flex-col items-center transition-colors ${
    isActive
      ? 'text-blue-500' // Ganti warna ini sesuai tema Anda (e.g., text-purple-500)
      : 'text-gray-400 hover:text-gray-600'
  }`;

export default function BottomNav() {
  return (
    <nav className="flex border-t bg-white shadow-lg sticky bottom-0">
      <NavLink to="/chat" className={getNavLinkClass}>
        <MessageCircle className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Chats</span>
      </NavLink>
      <NavLink to="/groups" className={getNavLinkClass}>
        <Users className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Grup</span>
      </NavLink>
      <NavLink to="/search" className={getNavLinkClass}>
        <Search className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Cari</span>
      </NavLink>
      <NavLink to="/profile" className={getNavLinkClass}>
        <User className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Profil</span>
      </NavLink>
    </nav>
  );
}