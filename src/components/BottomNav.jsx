// src/components/BottomNav.jsx

import { NavLink } from 'react-router-dom';
// Impor Phone, hapus Users
import { MessageCircle, Phone, Search, User } from 'lucide-react';

// Helper function (tidak berubah)
const getNavLinkClass = ({ isActive }) =>
  `flex-1 py-4 flex flex-col items-center transition-colors ${
    isActive
      ? 'text-blue-500'
      : 'text-gray-400 hover:text-gray-600'
  }`;

export default function BottomNav() {
  return (
    <nav className="flex border-t bg-white shadow-lg sticky bottom-0">
      <NavLink to="/chat" className={getNavLinkClass}>
        <MessageCircle className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Chats</span>
      </NavLink>

      <NavLink to="/call" className={getNavLinkClass}>
        <Phone className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Panggilan</span>
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