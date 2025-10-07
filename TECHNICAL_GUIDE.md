# 🛠️ ROTEN.KR 기술 가이드

## 프로젝트 개요
**ROTEN.KR**는 정부지원사업 정보를 한 곳에서 찾을 수 있는 통합 플랫폼입니다.

## 기술 스택
- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Domain**: Cloudflare DNS

## 데이터베이스 구조

### Supabase 연결 정보
```javascript
const supabaseUrl = 'https://csuziaogycciwgxxmahm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
```

### 테이블 구조

#### 1. bizinfo_complete (기업마당 - 4,159개)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| pblanc_nm | string | 공고명 |
| bsns_title | string | 사업 제목 |
| bsns_sumry | string | 사업 요약 |
| sprt_cn | string | 지원 내용 |
| reqst_begin_ymd | date | 신청 시작일 |
| reqst_end_ymd | date | 신청 마감일 |
| loc_nm | string | 지역명 |
| organ_nm | string | 기관명 |
| tot_sprt_amount | string | 총 지원금액 |
| dtl_url | string | 상세 URL |
| aply_url | string | 신청 URL |

#### 2. kstartup_complete (K-스타트업 - 1,527개)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| biz_pbanc_nm | string | 사업 공고명 |
| bsns_sumry | string | 사업 요약 |
| pbanc_ctnt | string | 공고 내용 |
| aply_trgt_ctnt | string | 신청 대상 내용 |
| pbanc_rcpt_bgng_dt | date | 접수 시작일 |
| pbanc_rcpt_end_dt | date | 접수 마감일 |
| supt_regin | string | 지원 지역 |
| pbanc_ntrp_nm | string | 공고 기업명 |
| detl_pg_url | string | 상세 페이지 URL |
| biz_aply_url | string | 사업 신청 URL |

## API 엔드포인트

### GET /api/search
정부지원사업 검색 및 필터링

**Query Parameters:**
- `q`: 검색어
- `region`: 지역 필터
- `stage`: 기업 단계 (예비창업, 1년차, 2년차, 3년차이상)
- `type`: 지원 유형 (자금, R&D, 교육, 시설)
- `deadline`: 마감일 필터 (긴급, 이번주, 이번달)

**Response:**
```json
{
  "results": [
    {
      "id": "biz_1",
      "business_name": "청년창업 지원사업",
      "summary_points": [
        {"icon": "💰", "label": "지원규모", "text": "최대 1억원"},
        {"icon": "✅", "label": "지원대상", "text": "39세 이하 창업 3년 미만"},
        {"icon": "⚡", "label": "특징", "text": "마감 3일 전!"}
      ],
      "days_remaining": 3,
      "is_expired": false,
      "is_urgent": true,
      "region": "서울",
      "end_date": "2025-10-10",
      "organization": "중소벤처기업부"
    }
  ],
  "total": 5686,
  "success": true
}
```

### GET /api/stats
통계 정보 조회

**Response:**
```json
{
  "total": 5686,
  "by_status": {
    "진행중": 5000,
    "마감": 686
  },
  "by_region": {
    "서울": 1200,
    "경기": 800,
    "전국": 2000
  }
}
```

## 핵심 함수

### 데이터 로드 (페이지네이션)
```javascript
// 전체 데이터를 1000개씩 나누어 로드
let allData = [];
let offset = 0;
const limit = 1000;

while (true) {
  const { data, error } = await supabase
    .from('bizinfo_complete')
    .select('*')
    .range(offset, offset + limit - 1);
  
  if (!data || data.length === 0) break;
  allData = allData.concat(data);
  
  if (data.length < limit) break;
  offset += limit;
}
```

### D-day 계산
```javascript
function getDaysRemaining(endDate) {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
}
```

### 3줄 요약 생성
```javascript
function generateSummary(item) {
  const summaryPoints = [];
  
  // 지원규모
  summaryPoints.push({
    icon: '💰',
    label: '지원규모',
    text: item.tot_sprt_amount || '지원금 제공'
  });
  
  // 지원대상
  summaryPoints.push({
    icon: '✅',
    label: '지원대상',
    text: item.sprt_trgt || '중소기업 및 스타트업'
  });
  
  // 긴급도
  const daysLeft = getDaysRemaining(item.reqst_end_ymd);
  if (daysLeft <= 7) {
    summaryPoints.push({
      icon: '⚡',
      label: '긴급',
      text: `마감 ${daysLeft}일 전!`
    });
  }
  
  return summaryPoints;
}
```

## 배포 및 환경 설정

### Vercel 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL=https://csuziaogycciwgxxmahm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_KEY=[SERVICE_KEY]
```

### 도메인 설정 (Cloudflare)
1. A 레코드: roten.kr → Vercel IP
2. CNAME: www → cname.vercel-dns.com
3. SSL: Full (strict)

## 성능 최적화

### 1. 데이터 캐싱
- 전체 데이터를 초기 로드 시 한 번만 가져옴
- 클라이언트 사이드에서 필터링 수행

### 2. 페이지네이션
- 화면에 12개씩 표시
- 가상 스크롤링 고려 중

### 3. 검색 최적화
- 디바운싱 적용 예정
- 벡터 검색 구현 예정 (pgvector)

## 트러블슈팅

### 문제 1: 1000개 데이터 제한
**원인**: Supabase의 기본 range 제한
**해결**: while 루프로 페이지네이션 구현

### 문제 2: 마감 공고 노출
**원인**: 필터링 미적용
**해결**: `is_expired` 플래그로 자동 필터링

### 문제 3: 검색 성능
**원인**: 단순 문자열 매칭
**계획**: 벡터 임베딩 검색 구현

## 향후 개발 계획

1. **벡터 검색 (2025.10)**
   - Supabase pgvector 확장
   - OpenAI 임베딩
   - 시맨틱 검색

2. **사용자 시스템 (2025.11)**
   - 로그인/회원가입
   - 맞춤 추천
   - 알림 설정

3. **AI 챗봇 (2025.12)**
   - 대화형 검색
   - 자동 매칭
   - 신청 가이드

---

*Last Updated: 2025-10-07*