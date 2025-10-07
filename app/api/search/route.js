import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 연결
const supabaseUrl = 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXppYW9neWNjaXdneHhtYWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxNTc4MCwiZXhwIjoyMDY5MTkxNzgwfQ.HnhM7zSLzi7lHVPd2IVQKIACDq_YA05mBMgZbSN1c9Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10000');
    const offset = (page - 1) * limit;

    console.log('API 검색 요청:', { query, page, limit });

    // 두 테이블에서 데이터 가져오기
    let allData = [];
    let totalCount = 0;

    // 1. bizinfo_complete 테이블에서 데이터 가져오기 (기업마당)
    const { data: bizinfoData, count: bizinfoCount } = await supabase
      .from('bizinfo_complete')
      .select('*', { count: 'exact' })
      .range(0, limit);

    // 2. kstartup_complete 테이블에서 데이터 가져오기 (K-스타트업)
    const { data: kstartupData, count: kstartupCount } = await supabase
      .from('kstartup_complete')
      .select('*', { count: 'exact' })
      .range(0, limit);

    console.log('bizinfo:', bizinfoCount, '개, kstartup:', kstartupCount, '개');

    // 데이터 통합 및 변환
    if (bizinfoData) {
      allData = allData.concat(bizinfoData.map(item => ({
        id: item.id,
        business_name: item.pblanc_nm || item.bsns_title || '',
        title: item.pblanc_nm || item.bsns_title || '',
        summary: item.bsns_sumry || item.pblanc_cn || '',
        description: item.sprt_cn || item.bsns_purpose || '',
        region: item.loc_nm || item.sprt_regin || '전국',
        end_date: item.reqst_end_ymd || item.application_end_date || null,
        start_date: item.reqst_begin_ymd || item.application_start_date || null,
        status: item.pblanc_stts || item.reqst_stts || '진행중',
        support_scale: item.tot_sprt_amount || item.indv_sprt_amount || item.compny_sprt_amount || '',
        organization: item.organ_nm || item.spnsr_organ_nm || '',
        detail_url: item.dtl_url || item.detail_url || '',
        apply_url: item.aply_url || '',
        source: 'bizinfo',
        original_id: item.pblanc_id
      })));
    }

    if (kstartupData) {
      allData = allData.concat(kstartupData.map(item => ({
        id: item.id + 10000, // ID 충돌 방지
        business_name: item.biz_pbanc_nm || item.bsns_title || '',
        title: item.biz_pbanc_nm || item.bsns_title || '',
        summary: item.bsns_sumry || item.pbanc_ctnt || '',
        description: item.pbanc_ctnt || '',
        region: item.supt_regin || item.region || '전국',
        end_date: item.pbanc_rcpt_end_dt || item.recept_end_dt || null,
        start_date: item.pbanc_rcpt_bgng_dt || item.recept_start_dt || null,
        status: item.status || '진행중',
        support_scale: item.support_type || '',
        organization: item.pbanc_ntrp_nm || item.spnsr_organ_nm || '',
        detail_url: item.detl_pg_url || item.source_url || '',
        apply_url: item.biz_aply_url || '',
        source: 'kstartup',
        original_id: item.announcement_id
      })));
    }

    totalCount = (bizinfoCount || 0) + (kstartupCount || 0);

    // 검색어 필터
    if (query && query.trim() !== '') {
      const searchLower = query.toLowerCase();
      allData = allData.filter(item => {
        const name = (item.business_name || item.title || '').toLowerCase();
        const summary = (item.summary || item.description || '').toLowerCase();
        return name.includes(searchLower) || summary.includes(searchLower);
      });
    }

    // 페이지네이션 적용
    const paginatedData = allData.slice(offset, offset + limit);

    console.log(`API 응답: ${paginatedData.length}개 반환 (전체: ${totalCount}개)`);

    return NextResponse.json({
      results: paginatedData,
      total: totalCount,
      page,
      limit,
      success: true,
      message: `${paginatedData.length}개 데이터 로드 완료 (bizinfo + kstartup)`
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