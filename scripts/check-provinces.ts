import { supabase } from '@/lib/supabase'

async function checkProvincesData() {
  // console.log('🔍 Checking provinces data in database...')
  
  try {
    const { data, error } = await supabase
      .from('provinces')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Error fetching provinces:', error)
      return
    }
    
    // console.log('✅ Provinces data found:', data)
    // console.log('📊 Total provinces:', data?.length)
    
    // Check specific codes that appear in results
    const specificCodes = ['010', '020', '030']
    for (const code of specificCodes) {
      const { data: provinceData } = await supabase
        .from('provinces')
        .select('*')
        .eq('id_province', code)
        .single()
      
      console.log(`🏷️ Province ${code}:`, provinceData)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkProvincesData()
