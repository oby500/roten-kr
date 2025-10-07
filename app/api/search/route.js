import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 연결 - SERVICE ROLE KEY 사용 (모든 데이터 접근)
const supabaseUrl = 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXppYW9neWNjaXdneHhtYWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzA4NjY4NSwiZXhwIjoyMDQyNjYyNjg1fQ.xqQiWQ0vUqL4N07nuKBkjFA2gEjQMpfzX8g7a6eJvus';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10000'); // 충분히 큰 수
    const offset = (page - 1) * limit;

    console.log('API 검색 요청:', { query, page, limit });

    // 먼저 전체 카운트
    const { count: totalCount, error: countError } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
    }

    // 데이터 조회
    let supabaseQuery = supabase
      .from('businesses')
      .select('*');

    // 검색어 필터
    if (query && query.trim() !== '') {
      supabaseQuery = supabaseQuery.or(`
        business_name.ilike.%${query}%,
        title.ilike.%${query}%,
        summary.ilike.%${query}%,
        description.ilike.%${query}%
      `);
    }

    // 페이지네이션 및 정렬
    const { data, error } = await supabaseQuery
      .range(offset, Math.min(offset + limit - 1, 10000)) // Supabase 최대 한계
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase 조회 에러:', error);
      throw error;
    }

    console.log(`API 응답: ${data?.length || 0}개 데이터 반환 (전체: ${totalCount}개)`);

    return NextResponse.json({
      results: data || [],
      total: totalCount || 0,
      page,
      limit,
      success: true,
      message: `${data?.length || 0}개 데이터 로드 완료`
    });
  } catch (error) {
    console.error('검색 API 에러:', error);
    return NextResponse.json(
      { 
        error: '데이터 조회 실패', 
        results: [],
        message: error.message,
        details: 'Service key를 사용했지만 오류 발생'
      },
      { status: 500 }
    );
  }
}