// Test Supabase Connection
// Run: node test-supabase-connection.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT FOUND');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('1️⃣ Testing basic connection...');
    
    // Test 1: Check if we can connect
    const { data: testData, error: testError } = await supabase
      .from('data_siswa_keasramaan')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      console.error('   Code:', testError.code);
      console.error('   Details:', testError.details);
      return;
    }
    
    console.log('✅ Connection successful!\n');
    
    // Test 2: Check rapor tables exist
    console.log('2️⃣ Checking rapor tables...');
    
    const tables = [
      'rapor_kegiatan_keasramaan',
      'rapor_dokumentasi_lainnya_keasramaan',
      'rapor_rekap_habit_keasramaan',
      'rapor_generate_log_keasramaan',
      'rapor_catatan_keasramaan',
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: NOT FOUND or NO ACCESS`);
        console.log(`      Error: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: EXISTS`);
      }
    }
    
    console.log('');
    
    // Test 3: Check data siswa
    console.log('3️⃣ Checking data siswa...');
    const { data: siswaData, error: siswaError, count } = await supabase
      .from('data_siswa_keasramaan')
      .select('nis, nama_siswa, cabang, kelas, asrama', { count: 'exact' })
      .limit(5);
    
    if (siswaError) {
      console.log('   ❌ Error:', siswaError.message);
    } else {
      console.log(`   ✅ Total santri: ${count || 0}`);
      console.log('   Sample data:');
      siswaData?.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.nama_siswa} (${s.nis}) - ${s.cabang} / ${s.kelas} / ${s.asrama}`);
      });
    }
    
    console.log('');
    
    // Test 4: Check habit tracker
    console.log('4️⃣ Checking habit tracker...');
    const { data: habitData, error: habitError, count: habitCount } = await supabase
      .from('formulir_habit_tracker_keasramaan')
      .select('id', { count: 'exact' })
      .limit(1);
    
    if (habitError) {
      console.log('   ❌ Error:', habitError.message);
    } else {
      console.log(`   ✅ Total entries: ${habitCount || 0}`);
    }
    
    console.log('');
    
    // Test 5: Check kegiatan
    console.log('5️⃣ Checking kegiatan rapor...');
    const { data: kegiatanData, error: kegiatanError, count: kegiatanCount } = await supabase
      .from('rapor_kegiatan_keasramaan')
      .select('*', { count: 'exact' })
      .limit(3);
    
    if (kegiatanError) {
      console.log('   ❌ Error:', kegiatanError.message);
      console.log('   ⚠️  Table might not exist. Run migration: 20241212_rapor_system.sql');
    } else {
      console.log(`   ✅ Total kegiatan: ${kegiatanCount || 0}`);
      if (kegiatanData && kegiatanData.length > 0) {
        console.log('   Sample data:');
        kegiatanData.forEach((k, i) => {
          console.log(`   ${i + 1}. ${k.nama_kegiatan} - ${k.cabang} / ${k.kelas} / ${k.asrama}`);
        });
      }
    }
    
    console.log('');
    
    // Test 6: Check catatan
    console.log('6️⃣ Checking catatan rapor...');
    const { data: catatanData, error: catatanError, count: catatanCount } = await supabase
      .from('rapor_catatan_keasramaan')
      .select('*', { count: 'exact' })
      .limit(3);
    
    if (catatanError) {
      console.log('   ❌ Error:', catatanError.message);
      console.log('   ⚠️  Table might not exist. Run migration: 20241212_rapor_system.sql');
    } else {
      console.log(`   ✅ Total catatan: ${catatanCount || 0}`);
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ CONNECTION TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();
