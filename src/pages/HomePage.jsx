import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <MessageCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          QwertyChat
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Tetap terhubung dengan orang-orang terkasih Anda
        </p>
        <div className="space-y-3">
          <Link
            to="/login" // Arahkan ke halaman login
            className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Mulai Chat
          </Link>
          <Link
            to="/profile" // Arahkan ke profil (jika sudah login)
            className="block w-full border-2 border-purple-500 text-purple-600 py-3 px-6 rounded-full font-semibold hover:bg-purple-50 transition-all duration-300"
          >
            Lihat Profil
          </Link>
        </div>
      </div>
    </div>
  );
}