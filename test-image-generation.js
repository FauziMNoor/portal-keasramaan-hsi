// Comprehensive Image Generation Test
// Run: node test-image-generation.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate getFullImageUrl function from slidesImageInserter.ts
function getFullImageUrl(path, bucket) {
  if (!path) return null;
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sirriyah.smaithsi.sch.id';
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  
  return publicUrl;
}

async function testImageGeneration() {
  console.log('═══════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE IMAGE GENERATION TEST');
  console.log('═══════════════════════════════════════════\n');

  try {
    // 1. Test Database Connection
    console.log('1️⃣ Testing Database Connection...');
    const { data: testData, error: testError } = await supabase
      .from('data_siswa_keasramaan')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connected\n');

    // 2. Get santri with foto from screenshot (Maulana Aqila Umar Abdul Aziz)
    console.log('2️⃣ Fetching Santri Data...');
    const { data: santri, error: santriError } = await supabase
      .from('data_siswa_keasramaan')
      .select('nis, nama_siswa, foto, kelas, asrama')
      .eq('nis', '202310029')
      .single();

    if (santriError || !santri) {
      console.error('❌ Santri not found:', santriError?.message);
      return;
    }

    console.log('✅ Santri found:');
    console.log(`   Nama: ${santri.nama_siswa}`);
    console.log(`   NIS: ${santri.nis}`);
    console.log(`   Kelas: ${santri.kelas}`);
    console.log(`   Asrama: ${santri.asrama}`);
    console.log(`   Foto (DB): ${santri.foto || 'NULL'}\n`);

    if (!santri.foto) {
      console.error('❌ No foto in database for this santri');
      return;
    }

    // 3. Test URL Conversion
    console.log('3️⃣ Testing URL Conversion...');
    const convertedUrl = getFullImageUrl(santri.foto, 'foto-siswa');
    console.log(`   Input: ${santri.foto}`);
    console.log(`   Output: ${convertedUrl}\n`);

    // 4. Test URL Accessibility
    console.log('4️⃣ Testing URL Accessibility...');
    try {
      const response = await fetch(convertedUrl, { method: 'HEAD' });
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
      
      if (response.ok) {
        console.log('   ✅ URL is accessible!\n');
      } else {
        console.log('   ❌ URL not accessible\n');
        return;
      }
    } catch (fetchError) {
      console.error('   ❌ Fetch failed:', fetchError.message, '\n');
      return;
    }

    // 5. Test Image Download
    console.log('5️⃣ Testing Image Download...');
    try {
      const downloadResponse = await fetch(convertedUrl, {
        signal: AbortSignal.timeout(30000),
      });
      
      if (!downloadResponse.ok) {
        console.error(`   ❌ Download failed: ${downloadResponse.status}`);
        return;
      }

      const arrayBuffer = await downloadResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`   ✅ Image downloaded successfully`);
      console.log(`   Size: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(2)} KB)\n`);
    } catch (downloadError) {
      console.error('   ❌ Download failed:', downloadError.message, '\n');
      return;
    }

    // 6. Test Kegiatan Images
    console.log('6️⃣ Testing Kegiatan Images...');
    const { data: kegiatan, error: kegiatanError } = await supabase
      .from('rapor_kegiatan_keasramaan')
      .select('*')
      .eq('nis', santri.nis)
      .eq('tahun_ajaran', '2024/2025')
      .eq('semester', 'Ganjil')
      .order('urutan');

    if (kegiatanError) {
      console.error('   ❌ Failed to fetch kegiatan:', kegiatanError.message);
    } else {
      console.log(`   Found ${kegiatan.length} kegiatan entries`);
      
      let kegiatanImageCount = 0;
      for (const keg of kegiatan) {
        if (keg.foto_1) {
          const url1 = getFullImageUrl(keg.foto_1, 'kegiatan-rapor');
          console.log(`   📸 Kegiatan ${keg.urutan}a: ${url1}`);
          kegiatanImageCount++;
        }
        if (keg.foto_2) {
          const url2 = getFullImageUrl(keg.foto_2, 'kegiatan-rapor');
          console.log(`   📸 Kegiatan ${keg.urutan}b: ${url2}`);
          kegiatanImageCount++;
        }
      }
      console.log(`   ✅ Total kegiatan images: ${kegiatanImageCount}\n`);
    }

    // 7. Test Dokumentasi Images
    console.log('7️⃣ Testing Dokumentasi Images...');
    const { data: dokumentasi, error: dokumentasiError } = await supabase
      .from('rapor_dokumentasi_keasramaan')
      .select('*')
      .eq('nis', santri.nis)
      .eq('tahun_ajaran', '2024/2025')
      .eq('semester', 'Ganjil');

    if (dokumentasiError) {
      console.error('   ❌ Failed to fetch dokumentasi:', dokumentasiError.message);
    } else {
      console.log(`   Found ${dokumentasi.length} dokumentasi entries`);
      
      for (const dok of dokumentasi) {
        const fotoPath = dok.foto || dok.foto_url;
        if (fotoPath) {
          const url = getFullImageUrl(fotoPath, 'dokumentasi-rapor');
          console.log(`   📸 Dokumentasi: ${url}`);
        }
      }
      console.log('');
    }

    // 8. Summary
    console.log('═══════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log('✅ Database: Connected');
    console.log('✅ Santri Data: Found');
    console.log('✅ Foto URL: Converted');
    console.log('✅ URL Accessibility: OK');
    console.log('✅ Image Download: OK');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Delete old rapor (click 🗑️ in legger table)');
    console.log('2. Generate new rapor');
    console.log('3. Check server console for logs:');
    console.log('   - "📸 Processing foto santri: ..."');
    console.log('   - "🔄 Converted to: ..."');
    console.log('   - "✅ Added foto santri to placeholders"');
    console.log('   - "📥 Downloading image from: ..."');
    console.log('   - "☁️ Uploading to Drive: ..."');
    console.log('   - "✅ Image inserted: ..."');
    console.log('4. Download PDF and verify foto appears');
    console.log('');
    console.log('⚠️  IF FOTO STILL NOT APPEARING:');
    console.log('   - Check Google Slides template has "<<Foto Santri>>" placeholder');
    console.log('   - Check Google OAuth has Drive access permissions');
    console.log('   - Check server can download from Supabase storage');
    console.log('═══════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testImageGeneration();
