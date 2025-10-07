import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXppYW9neWNjaXdneHhtYWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxNTc4MCwiZXhwIjoyMDY5MTkxNzgwfQ.HnhM7zSLzi7lHVPd2IVQKIACDq_YA05mBMgZbSN1c9Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// 날짜 계산 헬퍼
function getDaysRemaining(endDate) {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
}

// 지원 대상 파싱
function parseTarget(item) {
  const targets = [];
  const text = item.aply_trgt_ctnt || item.sprt_trgt || item.target_audience || '';
  
  if (text.includes('예비창업') || text.includes('예비 창업')) targets.push('예비창업');
  if (text.includes('1년') || text.includes('1년차')) targets.push('1년차');
  if (text.includes('2년') || text.includes('2년차')) targets.push('2년차');
  if (text.includes('3년') || text.includes('3년차')) targets.push('3년차');
  if (text.includes('청년')) targets.push('청년');
  if (text.includes('여성')) targets.push('여성');
  if (text.includes('중소기업') || text.includes('중소')) targets.push('중소기업');
  if (text.includes('스타트업')) targets.push('스타트업');
  
  return targets;
}

// 지원 유형 파싱
function parseSupportType(item) {
  const types = [];
  const text = `${item.sprt_cn || ''} ${item.support_type || ''} ${item.supt_biz_clsfc || ''}`;
  
  if (text.includes('자금') || text.includes('금융') || text.includes('융자')) types.push('자금지원');
  if (text.includes('R&D') || text.includes('연구개발') || text.includes('기술개발')) types.push('R&D');
  if (text.includes('교육') || text.includes('멘토링') || text.includes('컨설팅')) types.push('교육/컨설팅');
  if (text.includes('시설') || text.includes('공간') || text.includes('입주')) types.push('시설/공간');
  if (text.includes('마케팅') || text.includes('판로') || text.includes('수출')) types.push('마케팅/판로');
  if (text.includes('인력') || text.includes('고용') || text.includes('인건비')) types.push('인력지원');
  
  return types;
}

// 요약 생성 - 3줄 핵심 요약
function generateSummary(item) {
  const summaryPoints = [];
  
  // 1. 핵심 혜택 (지원 규모)
  if (item.tot_sprt_amount || item.sprt_scale) {
    const amount = item.tot_sprt_amount || item.sprt_scale;
    summaryPoints.push({
      icon: '💰',
      label: '지원규모',
      text: amount
    });
  } else {
    summaryPoints.push({
      icon: '💰',
      label: '지원규모',
      text: '지원금 제공'
    });
  }
  
  // 2. 주요 조건 (지원 대상)
  if (item.sprt_trgt || item.aply_trgt_ctnt) {
    const target = item.sprt_trgt || item.aply_trgt_ctnt;
    const shortTarget = target.length > 50 ? target.substring(0, 50) + '...' : target;
    summaryPoints.push({
      icon: '✅',
      label: '지원대상',
      text: shortTarget
    });
  } else {
    summaryPoints.push({
      icon: '✅',
      label: '지원대상',
      text: '중소기업 및 스타트업'
    });
  }
  
  // 3. 특별 포인트 (주요 내용)
  const content = item.bsns_sumry || item.pblanc_cn || item.sprt_cn || '';
  if (content) {
    const shortContent = content.substring(0, 40) + (content.length > 40 ? '...' : '');
    summaryPoints.push({
      icon: '🎯',
      label: '특징',
      text: shortContent
    });
  } else {
    summaryPoints.push({
      icon: '🎯',
      label: '특징',
      text: '우수 기업 선정 지원'
    });
  }
  
  return summaryPoints;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10000'); // 기본값을 10000으로 설정
    const filters = {
      businessStage: searchParams.get('stage') || '',
      supportType: searchParams.get('type') || '',
      region: searchParams.get('region') || '',
      deadline: searchParams.get('deadline') || ''
    };
    
    console.log('검색 요청:', { query, limit, filters });

    let allData = [];

    // 1. bizinfo_complete 전체 데이터 가져오기
    console.log('bizinfo_complete 데이터 로드 중...');
    let bizinfoData = [];
    let bizinfoOffset = 0;
    const bizinfoLimit = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('bizinfo_complete')
        .select('*')
        .range(bizinfoOffset, bizinfoOffset + bizinfoLimit - 1);
      
      if (error) {
        console.error('bizinfo 에러:', error);
        break;
      }
      
      if (!data || data.length === 0) break;
      
      bizinfoData = bizinfoData.concat(data);
      console.log(`bizinfo: ${bizinfoData.length}개 로드됨`);
      
      if (data.length < bizinfoLimit) break;
      bizinfoOffset += bizinfoLimit;
    }

    // 2. kstartup_complete 전체 데이터 가져오기
    console.log('kstartup_complete 데이터 로드 중...');
    let kstartupData = [];
    let kstartupOffset = 0;
    const kstartupLimit = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('kstartup_complete')
        .select('*')
        .range(kstartupOffset, kstartupOffset + kstartupLimit - 1);
      
      if (error) {
        console.error('kstartup 에러:', error);
        break;
      }
      
      if (!data || data.length === 0) break;
      
      kstartupData = kstartupData.concat(data);
      console.log(`kstartup: ${kstartupData.length}개 로드됨`);
      
      if (data.length < kstartupLimit) break;
      kstartupOffset += kstartupLimit;
    }

    console.log(`총 데이터: bizinfo ${bizinfoData.length}개 + kstartup ${kstartupData.length}개`);

    // 데이터 변환 - bizinfo
    if (bizinfoData && bizinfoData.length > 0) {
      allData = allData.concat(bizinfoData.map(item => {
        const daysRemaining = getDaysRemaining(item.reqst_end_ymd);
        
        return {
          id: `biz_${item.id}`,
          business_name: item.pblanc_nm || item.bsns_title || '제목 없음',
          title: item.pblanc_nm || item.bsns_title || '제목 없음',
          summary_points: generateSummary(item),
          full_summary: item.bsns_sumry || item.pblanc_cn || item.sprt_cn || '',
          description: item.sprt_cn || item.bsns_purpose || '',
          region: item.loc_nm || item.loc_rstr || '전국',
          end_date: item.reqst_end_ymd,
          start_date: item.reqst_begin_ymd,
          days_remaining: daysRemaining,
          is_expired: daysRemaining !== null && daysRemaining < 0,
          is_urgent: daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3,
          status: daysRemaining < 0 ? '마감' : (item.pblanc_stts || '진행중'),
          support_scale: item.tot_sprt_amount || item.sprt_scale || '',
          organization: item.organ_nm || item.spnsr_organ_nm || '',
          detail_url: item.dtl_url || '',
          apply_url: item.aply_url || '',
          source: 'bizinfo',
          targets: parseTarget(item),
          support_types: parseSupportType(item),
          original_id: item.pblanc_id
        };
      }));
    }

    // 데이터 변환 - kstartup
    if (kstartupData && kstartupData.length > 0) {
      allData = allData.concat(kstartupData.map(item => {
        const daysRemaining = getDaysRemaining(item.pbanc_rcpt_end_dt);
        
        return {
          id: `ks_${item.id}`,
          business_name: item.biz_pbanc_nm || item.bsns_title || '제목 없음',
          title: item.biz_pbanc_nm || item.bsns_title || '제목 없음',
          summary_points: generateSummary(item),
          full_summary: item.bsns_sumry || item.pbanc_ctnt || item.summary || '',
          description: item.pbanc_ctnt || item.aply_trgt_ctnt || '',
          region: item.supt_regin || item.region || '전국',
          end_date: item.pbanc_rcpt_end_dt,
          start_date: item.pbanc_rcpt_bgng_dt,
          days_remaining: daysRemaining,
          is_expired: daysRemaining !== null && daysRemaining < 0,
          is_urgent: daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3,
          status: daysRemaining < 0 ? '마감' : (item.status || '진행중'),
          support_scale: item.support_type || '',
          organization: item.pbanc_ntrp_nm || item.spnsr_organ_nm || '',
          detail_url: item.detl_pg_url || item.biz_gdnc_url || '',
          apply_url: item.biz_aply_url || '',
          source: 'kstartup',
          targets: parseTarget(item),
          support_types: parseSupportType(item),
          original_id: item.announcement_id
        };
      }));
    }

    console.log(`변환된 전체 데이터: ${allData.length}개`);

    // 마감된 공고 제외
    const beforeFilter = allData.length;
    allData = allData.filter(item => !item.is_expired);
    console.log(`마감 필터링: ${beforeFilter}개 → ${allData.length}개 (${beforeFilter - allData.length}개 제외)`);
    
    // 필터링
    if (filters.businessStage) {
      allData = allData.filter(item => {
        if (filters.businessStage === '예비창업') {
          return item.targets.includes('예비창업');
        } else if (filters.businessStage === '1년차') {
          return item.targets.includes('1년차') || item.targets.includes('스타트업');
        } else if (filters.businessStage === '2년차') {
          return item.targets.includes('2년차') || item.targets.includes('스타트업');
        } else if (filters.businessStage === '3년차이상') {
          return item.targets.includes('3년차') || item.targets.includes('중소기업');
        }
        return true;
      });
    }

    if (filters.supportType) {
      allData = allData.filter(item => 
        item.support_types.some(type => type.includes(filters.supportType))
      );
    }

    if (filters.region && filters.region !== '전국' && filters.region !== '전체') {
      allData = allData.filter(item => 
        item.region.includes(filters.region)
      );
    }

    if (filters.deadline) {
      allData = allData.filter(item => {
        const days = item.days_remaining;
        if (filters.deadline === '긴급' && days !== null) return days >= 0 && days <= 3;
        if (filters.deadline === '이번주' && days !== null) return days >= 0 && days <= 7;
        if (filters.deadline === '이번달' && days !== null) return days >= 0 && days <= 30;
        return true;
      });
    }

    // 검색어 필터
    if (query && query.trim() !== '') {
      const searchLower = query.toLowerCase();
      const searchWords = searchLower.split(' ');
      
      allData = allData.filter(item => {
        const searchText = `${item.business_name} ${item.full_summary} ${item.organization} ${item.targets.join(' ')} ${item.support_types.join(' ')}`.toLowerCase();
        
        // 모든 검색어가 포함되어 있는지 확인
        return searchWords.every(word => searchText.includes(word));
      });
    }

    // 정렬 (긴급한 것 우선, 그 다음 마감일 순)
    allData.sort((a, b) => {
      // 긴급 우선
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      
      // 마감일 순
      if (a.days_remaining !== null && b.days_remaining !== null) {
        return a.days_remaining - b.days_remaining;
      }
      
      // 마감일이 없는 것은 뒤로
      if (a.days_remaining === null && b.days_remaining !== null) return 1;
      if (a.days_remaining !== null && b.days_remaining === null) return -1;
      
      return 0;
    });

    const totalCount = allData.length;

    return NextResponse.json({
      results: allData,
      total: totalCount,
      success: true,
      message: `${totalCount}개 지원사업 찾음 (마감 제외)`
    });
  } catch (error) {
    console.error('API 에러:', error);
    return NextResponse.json(
      { 
        error: '데이터 조회 실패', 
        results: [],
        total: 0,
        message: error.message
      },
      { status: 500 }
    );
  }
}