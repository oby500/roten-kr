'use client';

import { useState, useEffect } from 'react';
import { Search, Building, Users, MapPin, Target, Sparkles } from 'lucide-react';

export default function SmartSearchForm({ onSearch, totalCount = 0 }) {
  const [formData, setFormData] = useState({
    location: '',
    businessStage: '',
    businessField: '',
    employeeCount: '',
    needs: ''
  });
  
  const [matchingCount, setMatchingCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  
  // 지역 자동완성 옵션
  const locations = [
    '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산',
    '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];
  
  // 사업 분야 자동완성
  const businessFields = [
    'IT/소프트웨어', '제조업', '바이오/헬스케어', '콘텐츠', 
    '유통/물류', '교육', '금융', '관광', '농업', '환경/에너지',
    '문화/예술', '사회서비스', '기타'
  ];

  // 자연어 처리 - 사용자 입력을 키워드로 변환
  const interpretNeeds = (needs) => {
    const needsMap = {
      '돈': ['자금지원', '융자', '보조금'],
      '자금': ['자금지원', '융자', '보조금'],
      '운영자금': ['자금지원', '운영자금', '융자'],
      '개발자금': ['자금지원', 'R&D', '기술개발'],
      '사무실': ['시설/공간', '입주공간', '사무공간'],
      '공간': ['시설/공간', '입주공간'],
      '연구': ['R&D', '연구개발', '기술개발'],
      '기술': ['R&D', '기술개발', '기술사업화'],
      '개발': ['R&D', '기술개발'],
      '수출': ['마케팅/판로', '수출지원', '해외진출'],
      '해외': ['마케팅/판로', '수출지원', '해외진출', '글로벌'],
      '마케팅': ['마케팅/판로', '홍보', '브랜딩'],
      '교육': ['교육/컨설팅', '멘토링', '교육지원'],
      '컨설팅': ['교육/컨설팅', '멘토링', '경영지원'],
      '인력': ['인력지원', '채용', '고용지원'],
      '직원': ['인력지원', '고용지원', '인건비'],
      '채용': ['인력지원', '채용지원', '고용지원']
    };
    
    const keywords = [];
    const lowerNeeds = needs.toLowerCase();
    
    Object.keys(needsMap).forEach(key => {
      if (lowerNeeds.includes(key)) {
        keywords.push(...needsMap[key]);
      }
    });
    
    // 중복 제거
    return [...new Set(keywords)];
  };

  // 실시간 매칭 카운트 계산
  useEffect(() => {
    const calculateMatching = () => {
      let count = totalCount;
      
      // 각 필드별로 대략적인 필터링 비율 적용 (실제 데이터 기반 추정)
      if (formData.location) count = Math.floor(count * 0.3); // 지역 필터
      if (formData.businessStage) count = Math.floor(count * 0.5); // 단계 필터
      if (formData.businessField) count = Math.floor(count * 0.4); // 분야 필터
      if (formData.employeeCount) count = Math.floor(count * 0.8); // 규모 필터
      if (formData.needs) count = Math.floor(count * 0.3); // 니즈 필터
      
      // 최소값 보장
      if (Object.values(formData).some(v => v)) {
        count = Math.max(count, 10);
      }
      
      setMatchingCount(count);
    };
    
    calculateMatching();
  }, [formData, totalCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    // 자연어 처리된 키워드 생성
    const keywords = interpretNeeds(formData.needs);
    
    // 검색 파라미터 구성
    const searchParams = {
      location: formData.location,
      businessStage: formData.businessStage,
      businessField: formData.businessField,
      employeeCount: formData.employeeCount,
      keywords: keywords,
      rawNeeds: formData.needs
    };
    
    // 부모 컴포넌트에 전달
    await onSearch(searchParams);
    setIsSearching(false);
  };

  const handleReset = () => {
    setFormData({
      location: '',
      businessStage: '',
      businessField: '',
      employeeCount: '',
      needs: ''
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            딱 맞는 지원사업을 찾아드릴게요!
          </h3>
          <p className="text-gray-500 mt-2">빈칸을 채워주시면 맞춤형 지원사업을 추천해드립니다</p>
        </div>
        {matchingCount > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">예상 매칭</p>
            <p className="text-3xl font-bold text-blue-600">{matchingCount}개</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 지역 & 기업 단계 */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">우리 회사는</span>
              <div className="relative inline-block">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  list="locations"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="지역 입력"
                  className="pl-9 pr-3 py-2 border-b-2 border-blue-400 bg-transparent focus:outline-none focus:border-blue-600"
                />
                <datalist id="locations">
                  {locations.map(loc => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
              <span className="text-lg">에 있는</span>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {['예비창업', '1년차', '2년차', '3년 이상'].map(stage => (
              <label key={stage} className="cursor-pointer">
                <input
                  type="radio"
                  name="businessStage"
                  value={stage}
                  checked={formData.businessStage === stage}
                  onChange={(e) => setFormData({...formData, businessStage: e.target.value})}
                  className="sr-only"
                />
                <span className={`px-4 py-2 rounded-full border-2 transition-all ${
                  formData.businessStage === stage 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                }`}>
                  {stage === '예비창업' ? '□' : '✓'} {stage}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 사업 분야 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 flex-wrap">
            <Building className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              list="businessFields"
              value={formData.businessField}
              onChange={(e) => setFormData({...formData, businessField: e.target.value})}
              placeholder="사업분야 입력 (예: IT, 제조업)"
              className="flex-1 min-w-[200px] px-3 py-2 border-b-2 border-blue-400 bg-transparent focus:outline-none focus:border-blue-600"
            />
            <datalist id="businessFields">
              {businessFields.map(field => (
                <option key={field} value={field} />
              ))}
            </datalist>
            <span className="text-lg">분야의 기업이고,</span>
          </div>
        </div>

        {/* 직원 수 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-lg">직원은</span>
            <input
              type="number"
              value={formData.employeeCount}
              onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
              placeholder="0"
              className="w-20 px-3 py-2 border-b-2 border-blue-400 bg-transparent focus:outline-none focus:border-blue-600 text-center"
              min="0"
            />
            <span className="text-lg">명이며,</span>
          </div>
        </div>

        {/* 필요한 지원 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-start gap-2 flex-wrap">
            <Target className="w-5 h-5 text-gray-400 mt-2" />
            <span className="text-lg">지금 가장 필요한 건</span>
            <textarea
              value={formData.needs}
              onChange={(e) => setFormData({...formData, needs: e.target.value})}
              placeholder="예: 운영자금, 사무실, 기술개발, 해외 진출"
              className="flex-1 min-w-[200px] px-3 py-2 border-b-2 border-blue-400 bg-transparent focus:outline-none focus:border-blue-600 resize-none"
              rows="2"
            />
            <span className="text-lg">입니다.</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            💡 자유롭게 작성해주세요. AI가 이해하고 적절한 지원사업을 찾아드립니다.
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 justify-center pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            초기화
          </button>
          <button
            type="submit"
            disabled={isSearching}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all transform hover:scale-105 font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {isSearching ? '검색 중...' : '맞춤 지원사업 찾기'}
          </button>
        </div>
      </form>
    </div>
  );
}
