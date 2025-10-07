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

    let allData = [];

    // 1. bizinfo_complete 테이블에서 모든 데이터 가져오기 (4,159개)
    const { data: bizinfoData, error: bizError } = await supabase
      .from('bizinfo_complete')
      .select('*')
      .range(0, 10000); // Supabase 한계를 고려한 큰 수

    if (bizError) {
      console.error('Bizinfo 에러:', bizError);
    }

    // 2. kstartup_complete 테이블에서 모든 데이터 가져오기 (1,527개)
    const { data: kstartupData, error: ksError } = await supabase
      .from('kstartup_complete')
      .select('*')
      .range(0, 10000);

    if (ksError) {
      console.error('Kstartup 에러:', ksError);
    }

    console.log('실제 로드된 데이터 - bizinfo:', bizinfoData?.length, '개, kstartup:', kstartupData?.length, '개');

    // 데이터 통합 및 변환
    if (bizinfoData && bizinfoData.length > 0) {
      allData = allData.concat(bizinfoData.map((item, index) => ({
        id: `biz_${item.id}`,
        business_name: item.pblanc_nm || item.bsns_title || '제목 없음',
        title: item.pblanc_nm || item.bsns_title || '제목 없음',
        summary: item.bsns_sumry || item.pblanc_cn || item.sprt_cn || '내용 없음',
        description: item.sprt_cn || item.bsns_purpose || item.pblanc_cn || '',
        region: item.loc_nm || item.loc_rstr || '전국',
        end_date: item.reqst_end_ymd,
        start_date: item.reqst_begin_ymd,
        status: item.pblanc_stts || item.reqst_stts || '진행중',
        support_scale: item.tot_sprt_amount || item.sprt_scale || '',
        organization: item.organ_nm || item.spnsr_organ_nm || '',
        detail_url: item.dtl_url || '',
        apply_url: item.aply_url || '',
        source: 'bizinfo',
        category: item.sprt_realm_nm || '',
        original_id: item.pblanc_id
      })));
    }

    if (kstartupData && kstartupData.length > 0) {
      allData = allData.concat(kstartupData.map((item, index) => ({
        id: `ks_${item.id}`,
        business_name: item.biz_pbanc_nm || item.bsns_title || '제목 없음',
        title: item.biz_pbanc_nm || item.bsns_title || '제목 없음',
        summary: item.bsns_sumry || item.pbanc_ctnt || item.summary || '내용 없음',
        description: item.pbanc_ctnt || item.aply_trgt_ctnt || '',
        region: item.supt_regin || item.region || '전국',
        end_date: item.pbanc_rcpt_end_dt,
        start_date: item.pbanc_rcpt_bgng_dt,
        status: item.status || '진행중',
        support_scale: item.support_type || '',
        organization: item.pbanc_ntrp_nm || item.spnsr_organ_nm || '',
        detail_url: item.detl_pg_url || item.biz_gdnc_url || '',
        apply_url: item.biz_aply_url || '',
        source: 'kstartup',
        category: item.supt_biz_clsfc || '',
        original_id: item.announcement_id
      })));
    }

    const totalCount = allData.length;
    console.log('통합 데이터 총:', totalCount, '개');

    // 검색어 필터
    if (query && query.trim() !== '') {
      const searchLower = query.toLowerCase();
      allData = allData.filter(item => {
        const name = (item.business_name || '').toLowerCase();
        const summary = (item.summary || '').toLowerCase();
        const org = (item.organization || '').toLowerCase();
        
        return name.includes(searchLower) || 
               summary.includes(searchLower) || 
               org.includes(searchLower);
      });
      console.log('검색 필터 적용 후:', allData.length, '개');
    }

    // 페이지네이션 적용 (프론트엔드용)
    const paginatedData = allData.slice(offset, offset + Math.min(limit, allData.length));

    return NextResponse.json({
      results: paginatedData,
      total: totalCount,
      filtered_total: allData.length,
      page,
      limit,
      success: true,
      bizinfo_count: bizinfoData?.length || 0,
      kstartup_count: kstartupData?.length || 0,
      message: `총 ${totalCount}개 (기업마당 ${bizinfoData?.length}개 + K-스타트업 ${kstartupData?.length}개)`
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