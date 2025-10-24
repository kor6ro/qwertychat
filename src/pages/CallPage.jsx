import { ArrowLeft, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function CallPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 shadow-lg sticky top-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Panggilan</h1>
          <button className="hover:bg-white/20 p-2 rounded-full transition">
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Konten (Placeholder) */}
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
        <p>Riwayat panggilan akan muncul di sini.</p>
      </div>

      <BottomNav />
    </div>
  );
}