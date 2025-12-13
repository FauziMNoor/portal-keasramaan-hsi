'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestRaporCompilePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [selectedNis, setSelectedNis] = useState('');
  const [selectedSantri, setSelectedSantri] = useState<any>(null);

  useEffect(() => {
    fetchSantri();
  }, []);

  const fetchSantri = async () => {
    const { data, error } = await supabase
      .from('data_siswa_keasramaan')
      .select('nis, nama_siswa, cabang, kelas, asrama')
      .order('nama_siswa')
      .limit(50);
    
    if (error) {
      console.error('Error fetching santri:', error);
      alert('Error: ' + error.message);
      return;
    }

    console.log('Fetched santri:', data);
    setSantriList(data || []);
    if (data && data.length > 0) {
      setSelectedNis(data[0].nis);
      setSelectedSantri(data[0]);
    } else {
      alert('Tidak ada data siswa di database!');
    }
  };

  const handleSantriChange = (nis: string) => {
    setSelectedNis(nis);
    const santri = santriList.find(s => s.nis === nis);
    setSelectedSantri(santri);
  };

  const testCompile = async () => {
    if (!selectedSantri) {
      alert('Pilih santri terlebih dahulu!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/rapor/test-compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nis: selectedSantri.nis,
          cabang: selectedSantri.cabang,
          tahunAjaran: '2024/2025',
          semester: 'Ganjil',
          kelas: selectedSantri.kelas,
          asrama: selectedSantri.asrama,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Test Rapor Data Compilation</h1>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <label className="block text-sm font-medium mb-2">Pilih Santri:</label>
        <select
          value={selectedNis}
          onChange={(e) => handleSantriChange(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          {santriList.map((s) => (
            <option key={s.nis} value={s.nis}>
              {s.nama_siswa} ({s.nis}) - {s.cabang} / {s.kelas} / {s.asrama}
            </option>
          ))}
        </select>

        {selectedSantri && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <div><strong>NIS:</strong> {selectedSantri.nis}</div>
            <div><strong>Nama:</strong> {selectedSantri.nama_siswa}</div>
            <div><strong>Cabang:</strong> {selectedSantri.cabang}</div>
            <div><strong>Kelas:</strong> {selectedSantri.kelas}</div>
            <div><strong>Asrama:</strong> {selectedSantri.asrama}</div>
          </div>
        )}
      </div>

      <button
        onClick={testCompile}
        disabled={loading || !selectedSantri}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg disabled:opacity-50 w-full"
      >
        {loading ? 'Testing...' : 'Test Compile Data'}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2">Result:</h2>
          <div className={`mb-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result.success ? '✅ Success' : '❌ Failed'}: {result.message}
          </div>
          
          {result.debug && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <div className="font-semibold mb-2">Debug Info:</div>
              <div>Has Santri: {result.debug.hasSantri ? '✅' : '❌'}</div>
              <div>Has Habit: {result.debug.hasHabit ? '✅' : '❌'}</div>
              <div>Kegiatan Count: {result.debug.kegiatanCount}</div>
              <div>Dokumentasi Count: {result.debug.dokumentasiCount}</div>
              <div>Has Catatan: {result.debug.hasCatatan ? '✅' : '❌'}</div>
            </div>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer font-semibold mb-2">Full Response (click to expand)</summary>
            <pre className="text-xs overflow-auto bg-white p-3 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
