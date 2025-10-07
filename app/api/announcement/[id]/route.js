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

// HTML 엔티티 디코딩
function decodeHtmlEntities(text) {
  if (!text) return text;
  return text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

// D-day 계산
function getDaysRemaining(endDate) {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log('상세 조회 요청:', id);

    // ID 파싱 (예: "biz_123" 또는 "ks_456")
    const [source, dbId] = id.split('_');

    let data = null;
    let error = null;

    if (source === 'biz') {
      // BizInfo 테이블에서 조회
      const result = await supabase
        .from('bizinfo_complete')
        .select('*')
        .eq('id', dbId)
        .single();

      data = result.data;
      error = result.error;

      if (data) {
        // 데이터 변환
        const daysRemaining = getDaysRemaining(data.reqst_end_ymd);

        data = {
          id: `biz_${data.id}`,
          business_name: decodeHtmlEntities(data.pblanc_nm || data.bsns_title) || '제목 없음',
          organization: decodeHtmlEntities(data.organ_nm || data.spnsr_organ_nm) || '기관명 없음',
          region: data.loc_nm || data.loc_rstr || '전국',
          start_date: data.reqst_begin_ymd,
          end_date: data.reqst_end_ymd,
          days_remaining: daysRemaining,
          support_scale: data.tot_sprt_amount || data.sprt_scale || '협의',
          target: decodeHtmlEntities(data.sprt_trgt) || '중소기업',
          simple_summary: decodeHtmlEntities(data.detailed_summary_ai || data.bsns_sumry) || '지원사업입니다',
          detailed_summary: decodeHtmlEntities(data.simple_summary_ai || data.pblanc_cn || data.sprt_cn) || '상세 내용이 없습니다',
          purpose: decodeHtmlEntities(data.bsns_purpose) || '중소기업 지원',
          attachment_urls: data.attachment_urls || [],
          detail_url: data.dtl_url || '',
          apply_url: data.aply_url || '',
          phone: data.organ_tel || '1577-8088',
          email: data.email || '',
          website: data.website || data.dtl_url || '',
          source: 'BizInfo'
        };
      }
    } else if (source === 'ks') {
      // K-Startup 테이블에서 조회
      const result = await supabase
        .from('kstartup_complete')
        .select('*')
        .eq('id', dbId)
        .single();

      data = result.data;
      error = result.error;

      if (data) {
        // 데이터 변환
        const daysRemaining = getDaysRemaining(data.pbanc_rcpt_end_dt);

        data = {
          id: `ks_${data.id}`,
          business_name: decodeHtmlEntities(data.biz_pbanc_nm || data.bsns_title) || '제목 없음',
          organization: decodeHtmlEntities(data.pbanc_ntrp_nm || data.spnsr_organ_nm) || '기관명 없음',
          region: data.supt_regin || '전국',
          start_date: data.pbanc_rcpt_bgng_dt,
          end_date: data.pbanc_rcpt_end_dt,
          days_remaining: daysRemaining,
          support_scale: data.support_type || '협의',
          target: decodeHtmlEntities(data.aply_trgt_ctnt) || '중소기업',
          simple_summary: decodeHtmlEntities(data.detailed_summary_ai || data.bsns_sumry) || '지원사업입니다',
          detailed_summary: decodeHtmlEntities(data.simple_summary_ai || data.pbanc_ctnt) || '상세 내용이 없습니다',
          purpose: decodeHtmlEntities(data.bsns_purpose) || '중소기업 지원',
          attachment_urls: data.attachment_urls || [],
          detail_url: data.detl_pg_url || data.biz_gdnc_url || '',
          apply_url: data.biz_aply_url || '',
          phone: data.phone || '1577-8088',
          email: data.email || '',
          website: data.website || data.detl_pg_url || '',
          source: 'K-Startup'
        };
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 ID 형식입니다'
        },
        { status: 400 }
      );
    }

    if (error) {
      console.error('DB 조회 에러:', error);
      return NextResponse.json(
        {
          success: false,
          error: '데이터를 찾을 수 없습니다',
          details: error.message
        },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: '데이터를 찾을 수 없습니다'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('API 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 에러가 발생했습니다',
        message: error.message
      },
      { status: 500 }
    );
  }
}
