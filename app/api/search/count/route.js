import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 자연어 needs를 키워드로 매핑
function interpretNeeds(input) {
  if (!input) return [];

  const text = input.toLowerCase();
  const keywords = [];

  // 자금/돈 관련
  if (text.match(/돈|자금|융자|대출|보조금|지원금|펀딩|투자|금융/)) {
    keywords.push('자금지원', '융자', '보조금', '투자유치', '금융지원');
  }

  // 공간/사무실 관련
  if (text.match(/사무실|공간|입주|시설|사무공간|오피스|공장|작업실/)) {
    keywords.push('입주공간', '시설지원', '공유오피스', '작업공간');
  }

  // 개발/R&D 관련
  if (text.match(/개발|연구|기술|r&d|R&D|혁신|제품개발|기술개발/)) {
    keywords.push('R&D', '연구개발', '기술개발', '혁신지원', '제품개발');
  }

  // 인력/채용 관련
  if (text.match(/직원|인력|채용|고용|인재|사람|팀원/)) {
    keywords.push('인력지원', '고용지원', '채용지원', '인건비');
  }

  // 마케팅/판로 관련
  if (text.match(/마케팅|홍보|판로|판매|영업|브랜딩|광고|해외진출|수출/)) {
    keywords.push('마케팅지원', '판로개척', '해외진출', '수출지원', '브랜딩');
  }

  // 교육/컨설팅 관련
  if (text.match(/교육|컨설팅|멘토링|코칭|자문|상담/)) {
    keywords.push('교육지원', '컨설팅', '멘토링', '전문가자문');
  }

  // 창업 관련
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
    if (stage === '예비창업') {
      keywords.push('예비창업자', '예비창업', '창업준비');
    } else if (stage === '1년차') {
      keywords.push('초기창업', '1년', '신규창업');
    } else if (stage === '3년차') {
      keywords.push('3년 이내', '초기기업', '스타트업');
    } else if (stage === '5년차') {
      keywords.push('5년 이내', '성장기업');
    } else if (stage === '7년 이상') {
      keywords.push('7년', '중소기업', '성숙기업');
    }
  });

  return keywords;
}

// 매칭 카운트 계산
export async function POST(request) {
  try {
    const { region, stage, field, needs } = await request.json();

    // BizInfo 테이블 쿼리
    let bizQuery = supabase
      .from('bizinfo_complete')
      .select('id', { count: 'exact', head: true });

    // K-Startup 테이블 쿼리
    let ksQuery = supabase
      .from('kstartup_complete')
      .select('id', { count: 'exact', head: true });

    // 지역 필터
    if (region && region !== '전국') {
      bizQuery = bizQuery.or(`loc_nm.ilike.%${region}%,loc_rstr.ilike.%${region}%`);
      ksQuery = ksQuery.ilike('rcpt_area_nm', `%${region}%`);
    }

    // 기업 단계 필터
    if (stage && stage.length > 0) {
      const stageKeywords = interpretStage(stage);
      if (stageKeywords.length > 0) {
        const stageConditions = stageKeywords.map(kw =>
          `sprt_trgt.ilike.%${kw}%,aply_trgt_ctnt.ilike.%${kw}%`
        ).join(',');
        bizQuery = bizQuery.or(stageConditions);

        const ksStageConditions = stageKeywords.map(kw =>
          `aply_trgt_cn.ilike.%${kw}%`
        ).join(',');
        ksQuery = ksQuery.or(ksStageConditions);
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

    // 필요사항 (자연어 처리)
    if (needs) {
      const needsKeywords = interpretNeeds(needs);
      if (needsKeywords.length > 0) {
        const needsConditions = needsKeywords.map(kw =>
          `sprt_cn.ilike.%${kw}%,bsns_sumry.ilike.%${kw}%,pblanc_nm.ilike.%${kw}%,sprt_trgt.ilike.%${kw}%`
        ).join(',');
        bizQuery = bizQuery.or(needsConditions);

        const ksNeedsConditions = needsKeywords.map(kw =>
          `pbanc_ctnt.ilike.%${kw}%,bsns_title.ilike.%${kw}%`
        ).join(',');
        ksQuery = ksQuery.or(ksNeedsConditions);
      }
    }

    // 양쪽 테이블에서 카운트 조회
    const [bizResult, ksResult] = await Promise.all([
      bizQuery,
      ksQuery
    ]);

    const totalCount = (bizResult.count || 0) + (ksResult.count || 0);

    return Response.json({
      success: true,
      count: totalCount,
      breakdown: {
        bizinfo: bizResult.count || 0,
        kstartup: ksResult.count || 0
      }
    });

  } catch (error) {
    console.error('Count API error:', error);
    return Response.json({
      success: false,
      error: error.message,
      count: 0
    }, { status: 500 });
  }
}
