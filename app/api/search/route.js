import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 직접 연결 (공개 가능한 anon key 사용)
const supabaseUrl = 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXppYW9neWNjaXdneHhtYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcwODY2ODUsImV4cCI6MjA0MjY2MjY4NX0.U3Ve7Gp5RsJJ99AKO7tAqXHkIqE9niGzpdrtgA8FtIE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '1000'); // 더 많은 데이터 가져오기
    const offset = (page - 1) * limit;

    console.log('API 검색 요청:', { query, page, limit });

    // 전체 데이터 카운트 먼저 가져오기
    const { count: totalCount } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    let supabaseQuery = supabase
      .from('businesses')
      .select('*');

    // 검색어가 있으면 필터링
    if (query && query.trim() !== '') {
      supabaseQuery = supabaseQuery.or(`
        business_name.ilike.%${query}%,
        title.ilike.%${query}%,
        summary.ilike.%${query}%,
        description.ilike.%${query}%
      `);
    }

    // 페이지네이션과 정렬
    const { data, error } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase 조회 에러:', error);
      throw error;
    }

    console.log(`API 응답: ${data?.length || 0}개 데이터 (전체: ${totalCount}개)`);

    return NextResponse.json({
      results: data || [],
      total: totalCount || data?.length || 0,
      page,
      limit,
      success: true
    });
  } catch (error) {
    console.error('검색 API 에러:', error);
    return NextResponse.json(
      { 
        error: '데이터 조회 실패', 
        results: [],
        message: error.message 
      },
      { status: 500 }
    );
  }
}