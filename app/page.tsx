import Sidebar from '@/components/Sidebar';
import { Calendar, MapPin, Building2, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">PORTAL KEASRAMAAN</h1>
            <p className="text-lg text-gray-600">HSI Boarding School</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8" />
                <span className="text-3xl font-bold">-</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Tahun Ajaran</h3>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <MapPin className="w-8 h-8" />
                <span className="text-3xl font-bold">-</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Lokasi</h3>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="w-8 h-8" />
                <span className="text-3xl font-bold">-</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Asrama</h3>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8" />
                <span className="text-3xl font-bold">-</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">Musyrif</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Selamat Datang</h2>
            <p className="text-gray-600 leading-relaxed">
              Portal Keasramaan HSI Boarding School adalah sistem manajemen data keasramaan yang terintegrasi. 
              Gunakan menu di sebelah kiri untuk mengelola data tahun ajaran, lokasi, asrama, kelas, rombel, 
              kepala asrama, dan musyrif.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
