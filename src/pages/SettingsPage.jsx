import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 shadow-lg sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)} // Tombol kembali
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Pengaturan</h1>
        </div>
      </div>

      {/* Konten (Placeholder) */}
      <div className="flex-1 p-4">
        <h2 className="text-lg font-semibold">Pengaturan Akun</h2>
        <p className="text-gray-600">Opsi pengaturan akan ada di sini...</p>
        {/* Tambahkan item pengaturan di sini */}
      </div>
      
      {/* Halaman ini tidak perlu BottomNav agar terasa seperti halaman sekunder */}
    </div>
  );
}