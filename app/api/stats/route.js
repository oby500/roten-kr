import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 전체 개수 가져오기
    const { count: totalCount } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    // 상태별 통계
    const { data: statusData } = await supabase
      .from('businesses')
      .select('status');
    
    const statusCounts = statusData?.reduce((acc, item) => {
      const status = item.status || '진행중';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      total: totalCount || 0,
      status: statusCounts || { '진행중': 0 },
      sources: {
        'K-Startup': 1527,
        'BizInfo': 4159
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}