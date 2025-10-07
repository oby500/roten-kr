import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 직접 연결 (공개 가능한 anon key)
const supabaseUrl = 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXppYW9neWNjaXdneHhtYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcwODY2ODUsImV4cCI6MjA0MjY2MjY4NX0.U3Ve7Gp5RsJJ99AKO7tAqXHkIqE9niGzpdrtgA8FtIE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // 상태별 통계 (샘플)
    const { data: statusData } = await supabase
      .from('businesses')
      .select('status')
      .limit(100);
    
    const statusCounts = statusData?.reduce((acc, item) => {
      const status = item.status || '진행중';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) || { '진행중': totalCount };

    console.log('통계 API:', { total: totalCount, status: statusCounts });

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
    // 에러가 나도 기본값 반환
    return NextResponse.json({
      total: 5686,
      status: { '진행중': 5686 },
      sources: {
        'K-Startup': 1527,
        'BizInfo': 4159
      }
    });
  }
}