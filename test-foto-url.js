// Test Foto URL
// Run: node test-foto-url.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFotoUrl() {
  console.log('🔍 Testing Foto URLs...\n');

  try {
    // 1. Get sample santri with foto
    const { data: santriList, error } = await supabase
      .from('data_siswa_keasramaan')
      .select('nis, nama_siswa, foto')
      .not('foto', 'is', null)
      .limit(5);

    if (error) throw error;

    console.log(`Found ${santriList.length} santri with foto:\n`);

    for (const santri of santriList) {
      console.log(`📸 ${santri.nama_siswa} (${santri.nis})`);
      console.log(`   Database value: ${santri.foto}`);

      // Check if it's relative or absolute
      if (santri.foto.startsWith('http')) {
        console.log(`   ✅ Already full URL`);
        console.log(`   URL: ${santri.foto}`);
      } else {
        console.log(`   ⚠️  Relative path - needs conversion`);
        
        // Convert to public URL
        const { data } = supabase.storage
          .from('foto-siswa')
          .getPublicUrl(santri.foto);
        
        console.log(`   Converted URL: ${data.publicUrl}`);
        
        // Test if URL is accessible
        try {
          const response = await fetch(data.publicUrl, { method: 'HEAD' });
          if (response.ok) {
            console.log(`   ✅ URL accessible (${response.status})`);
          } else {
            console.log(`   ❌ URL not accessible (${response.status})`);
          }
        } catch (fetchError) {
          console.log(`   ❌ URL fetch failed: ${fetchError.message}`);
        }
      }
      console.log('');
    }

    // 2. Test specific santri (Maulana Aqila Umar Abdul Aziz)
    console.log('─────────────────────────────────────────');
    console.log('Testing specific santri from image...\n');

    const { data: specificSantri } = await supabase
      .from('data_siswa_keasramaan')
      .select('nis, nama_siswa, foto')
      .ilike('nama_siswa', '%Maulana Aqila%')
      .single();

    if (specificSantri) {
      console.log(`📸 ${specificSantri.nama_siswa}`);
      console.log(`   NIS: ${specificSantri.nis}`);
      console.log(`   Foto: ${specificSantri.foto || 'NULL'}`);

      if (specificSantri.foto) {
        if (specificSantri.foto.startsWith('http')) {
          console.log(`   ✅ Full URL: ${specificSantri.foto}`);
        } else {
          const { data } = supabase.storage
            .from('foto-siswa')
            .getPublicUrl(specificSantri.foto);
          
          console.log(`   🔄 Converted: ${data.publicUrl}`);
          
          // Test accessibility
          try {
            const response = await fetch(data.publicUrl, { method: 'HEAD' });
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);
            
            if (response.ok) {
              console.log(`   ✅ Image is accessible!`);
            } else {
              console.log(`   ❌ Image not accessible`);
            }
          } catch (fetchError) {
            console.log(`   ❌ Fetch failed: ${fetchError.message}`);
          }
        }
      } else {
        console.log(`   ❌ No foto in database`);
      }
    } else {
      console.log('   ⚠️  Santri not found');
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ TEST COMPLETE');
    console.log('═══════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFotoUrl();
