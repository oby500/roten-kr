import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXppYW9neWNjaXdneHhtYWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYxNTc4MCwiZXhwIjoyMDY5MTkxNzgwfQ.HnhM7zSLzi7lHVPd2IVQKIACDq_YA05mBMgZbSN1c9Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 자연어 needs를 키워드로 매핑
function interpretNeeds(input) {
  if (!input) return [];

  const text = input.toLowerCase();
  const keywords = [];

  if (text.match(/돈|자금|융자|대출|보조금|지원금|펀딩|투자|금융/)) {
    keywords.push('자금지원', '융자', '보조금', '투자유치', '금융지원');
  }
  if (text.match(/사무실|공간|입주|시설|사무공간|오피스|공장|작업실/)) {
    keywords.push('입주공간', '시설지원', '공유오피스', '작업공간');
  }
  if (text.match(/개발|연구|기술|r&d|R&D|혁신|제품개발|기술개발/)) {
    keywords.push('R&D', '연구개발', '기술개발', '혁신지원', '제품개발');
  }
  if (text.match(/직원|인력|채용|고용|인재|사람|팀원/)) {
    keywords.push('인력지원', '고용지원', '채용지원', '인건비');
  }
  if (text.match(/마케팅|홍보|판로|판매|영업|브랜딩|광고|해외진출|수출/)) {
    keywords.push('마케팅지원', '판로개척', '해외진출', '수출지원', '브랜딩');
  }
  if (text.match(/교육|컨설팅|멘토링|코칭|자문|상담/)) {
    keywords.push('교육지원', '컨설팅', '멘토링', '전문가자문');
  }
  if (text.match(/창업|스타트업|startup|사업시작|예비창업/)) {
    keywords.push('창업지원', '예비창업', '초기창업');
  }

  return keywords;
}

// 기업 단계를 검색 키워드로 매핑
function interpretStage(stages) {
  if (!stages || stages.length === 0) return [];

  const keywords = [];
  stages.forEach(stage => {
    if (stage === '예비창업') keywords.push('예비창업자', '예비창업', '창업준비');
    else if (stage === '1년차') keywords.push('초기창업', '1년', '신규창업');
    else if (stage === '3년차') keywords.push('3년 이내', '초기기업', '스타트업');
    else if (stage === '5년차') keywords.push('5년 이내', '성장기업');
    else if (stage === '7년 이상') keywords.push('7년', '중소기업', '성숙기업');
  });

  return keywords;
}

// D-day 계산
function getDaysRemaining(endDate) {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
}

// 지원 유형 파싱
function parseSupportType(item) {
  const types = [];
  const text = `${item.pblanc_nm || ''} ${item.bsns_title || ''} ${item.sprt_cn || ''} ${item.pbanc_ctnt || ''}`.toLowerCase();

  if (text.includes('자금') || text.includes('융자') || text.includes('보조금')) types.push('자금지원');
  if (text.includes('r&d') || text.includes('연구개발') || text.includes('기술개발')) types.push('R&D');
  if (text.includes('교육') || text.includes('컨설팅')) types.push('교육/컨설팅');
  if (text.includes('시설') || text.includes('공간') || text.includes('입주')) types.push('시설/공간');
  if (text.includes('마케팅') || text.includes('판로')) types.push('마케팅/판로');
  if (text.includes('인력') || text.includes('고용')) types.push('인력지원');
  if (text.includes('창업')) types.push('창업지원');

  return types.length > 0 ? types : ['지원사업'];
}

// 매칭 점수 계산
function calculateMatchScore(item, formData) {
  let score = 0;

  // 지역 매칭 (30점)
  if (formData.region && formData.region !== '전국') {
    const itemRegion = item.loc_nm || item.rcpt_area_nm || '';
    if (itemRegion.includes(formData.region)) score += 30;
  }

  // 필요사항 매칭 (40점)
  if (formData.needs) {
    const needsKeywords = interpretNeeds(formData.needs);
    const itemText = `${item.pblanc_nm || ''} ${item.bsns_title || ''} ${item.sprt_cn || ''} ${item.pbanc_ctnt || ''}`.toLowerCase();

    let matchedKeywords = 0;
    needsKeywords.forEach(keyword => {
      if (itemText.includes(keyword.toLowerCase())) matchedKeywords++;
    });
    score += (matchedKeywords / Math.max(needsKeywords.length, 1)) * 40;
  }

  // 단계 매칭 (20점)
  if (formData.stage && formData.stage.length > 0) {
    const stageKeywords = interpretStage(formData.stage);
    const targetText = `${item.sprt_trgt || ''} ${item.aply_trgt_cn || ''}`.toLowerCase();

    let matchedStages = 0;
    stageKeywords.forEach(keyword => {
      if (targetText.includes(keyword.toLowerCase())) matchedStages++;
    });
    score += (matchedStages / Math.max(stageKeywords.length, 1)) * 20;
  }

  // 분야 매칭 (10점)
  if (formData.field) {
    const itemText = `${item.pblanc_nm || ''} ${item.bsns_title || ''} ${item.bsns_sumry || ''}`.toLowerCase();
    if (itemText.includes(formData.field.toLowerCase())) score += 10;
  }

  return Math.round(score);
}

// 3줄 요약 생성
function generateSummary(item) {
  return [
    {
      icon: '💰',
      label: '지원규모',
      text: item.tot_sprt_amount || item.sprt_scale || '지원금 제공'
    },
    {
      icon: '✅',
      label: '지원대상',
      text: item.sprt_trgt || item.aply_trgt_cn || '중소기업 및 스타트업'
    },
    {
      icon: '🎯',
      label: '특징',
      text: (item.bsns_sumry || item.pbanc_ctnt || item.sprt_cn || '').substring(0, 40) + '...'
    }
  ];
}

// 스마트 검색 API
export async function POST(request) {
  try {
    const { region, stage, field, needs } = await request.json();

    // BizInfo 검색
    let bizQuery = supabase.from('bizinfo_complete').select('*');
    let ksQuery = supabase.from('kstartup_complete').select('*');

    // 지역 필터
    if (region && region !== '전국') {
      bizQuery = bizQuery.or(`loc_nm.ilike.%${region}%,loc_rstr.ilike.%${region}%`);
      ksQuery = ksQuery.ilike('rcpt_area_nm', `%${region}%`);
    }

    // 기업 단계 필터
    if (stage && stage.length > 0) {
      const stageKeywords = interpretStage(stage);
      if (stageKeywords.length > 0) {
        const conditions = stageKeywords.map(kw =>
          `sprt_trgt.ilike.%${kw}%,aply_trgt_ctnt.ilike.%${kw}%`
        ).join(',');
        bizQuery = bizQuery.or(conditions);

        const ksConditions = stageKeywords.map(kw =>
          `aply_trgt_cn.ilike.%${kw}%`
        ).join(',');
        ksQuery = ksQuery.or(ksConditions);
      }
    }

    // 사업 분야 필터
    if (field) {
      bizQuery = bizQuery.or(
        `bsns_sumry.ilike.%${field}%,pblanc_nm.ilike.%${field}%,sprt_cn.ilike.%${field}%`
      );
      ksQuery = ksQuery.or(
        `bsns_title.ilike.%${field}%,pbanc_ctnt.ilike.%${field}%`
      );
    }

    // 필요사항 필터
    if (needs) {
      const keywords = interpretNeeds(needs);
      if (keywords.length > 0) {
        const conditions = keywords.map(kw =>
          `sprt_cn.ilike.%${kw}%,bsns_sumry.ilike.%${kw}%,pblanc_nm.ilike.%${kw}%`
        ).join(',');
        bizQuery = bizQuery.or(conditions);

        const ksConditions = keywords.map(kw =>
          `pbanc_ctnt.ilike.%${kw}%,bsns_title.ilike.%${kw}%`
        ).join(',');
        ksQuery = ksQuery.or(ksConditions);
      }
    }

    // 데이터 조회
    const [bizResult, ksResult] = await Promise.all([
      bizQuery.limit(500),
      ksQuery.limit(500)
    ]);

    // 데이터 변환 및 점수 계산
    const bizData = (bizResult.data || []).map(item => ({
      id: `biz_${item.id}`,
      business_name: item.pblanc_nm || item.bsns_title || '제목 없음',
      organization: item.organ_nm || item.spnsr_organ_nm || '기관명 없음',
      region: item.loc_nm || item.loc_rstr || '전국',
      start_date: item.reqst_begin_ymd,
      end_date: item.reqst_end_ymd,
      days_remaining: getDaysRemaining(item.reqst_end_ymd),
      support_scale: item.tot_sprt_amount || item.sprt_scale || '협의',
      target: item.sprt_trgt || '중소기업',
      support_types: parseSupportType(item),
      summary_points: generateSummary(item),
      source: 'BizInfo',
      matchScore: calculateMatchScore(item, { region, stage, field, needs })
    }));

    const ksData = (ksResult.data || []).map(item => ({
      id: `ks_${item.id}`,
      business_name: item.bsns_title || item.biz_pbanc_nm || '제목 없음',
      organization: item.organ_nm || item.spnsr_organ_nm || '기관명 없음',
      region: item.rcpt_area_nm || '전국',
      start_date: item.pbanc_rcpt_bgn_dt,
      end_date: item.pbanc_rcpt_end_dt,
      days_remaining: getDaysRemaining(item.pbanc_rcpt_end_dt),
      support_scale: item.sprt_scale || '협의',
      target: item.aply_trgt_cn || '중소기업',
      support_types: parseSupportType(item),
      summary_points: generateSummary(item),
      source: 'K-Startup',
      matchScore: calculateMatchScore(item, { region, stage, field, needs })
    }));

    // 합치고 점수순 정렬
    const allData = [...bizData, ...ksData]
      .sort((a, b) => b.matchScore - a.matchScore);

    return Response.json({
      success: true,
      data: allData,
      total: allData.length,
      filters: { region, stage, field, needs }
    });

  } catch (error) {
    console.error('Smart search error:', error);
    return Response.json({
      success: false,
      error: error.message,
      data: []
    }, { status: 500 });
  }
}
