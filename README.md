# 🎯 ROTEN.KR - 정부지원사업 통합 플랫폼

> 모든 정부지원사업을 한 곳에서 찾아보세요!

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://roten-kr.vercel.app)
[![Data Count](https://img.shields.io/badge/Total%20Programs-5,686-blue)]()
[![Status](https://img.shields.io/badge/Status-Active-success)]()

## 📌 프로젝트 소개

ROTEN.KR은 기업마당, K-스타트업 등 여러 정부 기관에 흩어져 있는 지원사업 정보를 한 곳에서 통합 검색할 수 있는 플랫폼입니다.

### 주요 기능
- 🔍 **통합 검색**: 5,686개 정부지원사업 실시간 검색
- 🎨 **직관적 UI**: 색상 태그로 긴급도 한눈에 파악
- 📊 **3줄 요약**: 핵심 정보만 빠르게 확인
- ⚡ **빠른 시작**: 4가지 카테고리로 즉시 찾기
- 📱 **반응형 디자인**: 모바일/PC 모두 최적화

## 🚀 Quick Start

### 웹사이트 방문
👉 [https://roten.kr](https://roten.kr)

### 로컬 실행
```bash
# 저장소 클론
git clone https://github.com/oby500/roten-kr.git
cd roten-kr

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# http://localhost:3000 접속
```

## 🗂️ 프로젝트 구조

```
roten-kr/
├── app/
│   ├── api/
│   │   ├── search/      # 검색 API
│   │   └── stats/        # 통계 API
│   ├── detail/           # 상세페이지
│   ├── page.js           # 메인 페이지
│   ├── layout.js         # 레이아웃
│   └── globals.css       # 전역 스타일
├── public/               # 정적 파일
├── tailwind.config.js    # Tailwind 설정
└── package.json          # 프로젝트 설정
```

## 📊 데이터 현황

| 출처 | 데이터 수 | 최종 업데이트 |
|------|-----------|---------------|
| 기업마당 (bizinfo) | 4,159개 | 2025.10.07 |
| K-스타트업 (kstartup) | 1,527개 | 2025.10.07 |
| **총계** | **5,686개** | - |

## 🎨 UI/UX 특징

### D-day 색상 시스템
- 🔴 **빨간색**: 3일 이내 마감 (긴급)
- 🟠 **주황색**: 7일 이내 마감
- 🟡 **노란색**: 14일 이내 마감
- 🟢 **초록색**: 30일 이내 마감
- 🔵 **파란색**: 30일 초과
- ⚫ **회색**: 상시 모집

### 3줄 핵심 요약
각 공고마다 자동으로 생성되는 핵심 정보:
1. 💰 **지원규모**: 최대 지원 금액
2. ✅ **지원대상**: 주요 대상 기업
3. ⚡ **특별포인트**: 긴급도 또는 핵심 특징

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Domain**: Cloudflare DNS

## 📈 주요 성과

- ✅ 5,686개 데이터 통합 완료
- ✅ 실시간 마감 필터링
- ✅ 반응형 디자인 구현
- ✅ 빠른 검색 (2-3초 내)

## 🗓️ 개발 로드맵

### 완료 (2025.10.07)
- [x] 전체 데이터 로드 시스템
- [x] 마감 공고 자동 필터링
- [x] 색상 태그 시스템
- [x] 3줄 요약 기능
- [x] 빠른 시작 옵션

### 진행 예정
- [ ] 벡터 검색 (시맨틱 검색)
- [ ] 상세페이지 실제 데이터 연동
- [ ] 사용자 맞춤 추천
- [ ] 알림 기능
- [ ] AI 챗봇 상담

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

- GitHub: [@oby500](https://github.com/oby500)
- Website: [https://roten.kr](https://roten.kr)

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>🚀 Making government support programs accessible to everyone</strong>
</div>