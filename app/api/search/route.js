import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;

    let supabaseQuery = supabase
      .from('businesses')
      .select('*');

    // 검색어가 있으면 필터링
    if (query) {
      supabaseQuery = supabaseQuery.or(`
        business_name.ilike.%${query}%,
        title.ilike.%${query}%,
        summary.ilike.%${query}%,
        description.ilike.%${query}%
      `);
    }

    // 페이지네이션
    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    return NextResponse.json({
      results: data || [],
      total: count || 0,
      page,
      limit
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search', results: [] },
      { status: 500 }
    );
  }
}