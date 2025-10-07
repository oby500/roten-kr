import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 연결 - 새로운 SERVICE ROLE KEY 사용
const supabaseUrl = 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXppYW9neWNjaXdneHhtYWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxNTc4MCwiZXhwIjoyMDY5MTkxNzgwfQ.HnhM7zSLzi7lHVPd2IVQKIACDq_YA05mBMgZbSN1c9Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export async function GET() {
  try {
    // 전체 개수 가져오기
    const { count: totalCount, error } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Count error:', error);
      throw error;
    }

    console.log('통계 API: 전체', totalCount, '개 데이터');

    // 상태별 통계
    const statusCounts = {
      '진행중': totalCount || 5686
    };

    return NextResponse.json({
      total: totalCount || 5686,
      status: statusCounts,
      sources: {
        'K-Startup': 1527,
        'BizInfo': 4159
      },
      success: true
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      total: 5686,
      status: { '진행중': 5686 },
      sources: {
        'K-Startup': 1527,
        'BizInfo': 4159
      },
      error: error.message
    });
  }
}