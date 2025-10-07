'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Target, TrendingUp } from 'lucide-react';

export default function SmartSearchForm({ onSearch }) {
  const [formData, setFormData] = useState({
    region: '',
    stage: [],
    field: '',
    employees: '',
    needs: '',
    supportType: []
  });

  const [matchCount, setMatchCount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 기업 단계 옵션
  const stageOptions = [
    '예비창업',
    '1년차',
    '3년차',
    '5년차',
    '7년 이상'
  ];

  // 사업 분야 옵션
  const fieldOptions = [
    'IT/소프트웨어',
    '제조업',
    '바이오/헬스케어',
    '문화/콘텐츠',
    '서비스업',
    '유통/물류',
    '농업/식품',
    '환경/에너지',
    '건설/건축',
    '기타'
  ];

  // 지역 옵션
  const regionOptions = [
    '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
    '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '전국'
  ];

  // 체크박스 토글
  const toggleStage = (stage) => {
    setFormData(prev => ({
      ...prev,
      stage: prev.stage.includes(stage)
        ? prev.stage.filter(s => s !== stage)
        : [...prev.stage, stage]
    }));
  };

  // 입력값 변경
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 실시간 매칭 카운트 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.region || formData.stage.length > 0 || formData.field || formData.needs) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/search/count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          const data = await response.json();
          setMatchCount(data.count);
        } catch (error) {
          console.error('매칭 카운트 로드 실패:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setMatchCount(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  // 검색 실행
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(formData);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-3 rounded-xl">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            딱 맞는 지원사업을 찾아드릴게요!
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            간단한 정보만 입력하면 AI가 최적의 지원사업을 추천해드립니다
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: 지역 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <label className="font-semibold text-gray-700">우리 회사는</label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              list="regions"
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              placeholder="지역을 선택하세요"
              className="flex-1 min-w-[200px] px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
            <datalist id="regions">
              {regionOptions.map(region => (
                <option key={region} value={region} />
              ))}
            </datalist>
            <span className="text-gray-700 font-medium">에 있는</span>
          </div>
        </div>

        {/* Step 2: 기업 단계 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-green-600" />
            <label className="font-semibold text-gray-700">기업 단계</label>
          </div>
          <div className="flex flex-wrap gap-3">
            {stageOptions.map(stage => (
              <label
                key={stage}
                className={`flex items-center px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.stage.includes(stage)
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-green-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.stage.includes(stage)}
                  onChange={() => toggleStage(stage)}
                  className="hidden"
                />
                <span className="font-medium">{stage}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Step 3: 사업 분야 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-purple-600" />
            <label className="font-semibold text-gray-700">사업 분야</label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              list="fields"
              value={formData.field}
              onChange={(e) => handleChange('field', e.target.value)}
              placeholder="IT, 제조, 바이오 등"
              className="flex-1 min-w-[200px] px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            />
            <datalist id="fields">
              {fieldOptions.map(field => (
                <option key={field} value={field} />
              ))}
            </datalist>
            <span className="text-gray-700 font-medium">분야의 기업이고,</span>
          </div>
        </div>

        {/* Step 4: 필요사항 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <label className="font-semibold text-gray-700">지금 가장 필요한 건</label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={formData.needs}
              onChange={(e) => handleChange('needs', e.target.value)}
              placeholder="운영자금, 사무실, 기술개발, 직원채용 등"
              className="flex-1 min-w-[250px] px-4 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
            />
            <span className="text-gray-700 font-medium">입니다.</span>
          </div>
        </div>

        {/* 매칭 카운트 */}
        {matchCount !== null && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-full p-2">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">현재 조건에 맞는 지원사업</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading ? '검색 중...' : `${matchCount}개`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 검색 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Search className="w-6 h-6" />
          {isLoading ? '검색 중...' : '🔍 맞춤 지원사업 찾기'}
        </button>
      </form>

      {/* 안내 문구 */}
      <div className="mt-4 text-center text-sm text-gray-500">
        💡 최소 1개 이상의 조건을 입력하면 더 정확한 결과를 얻을 수 있습니다
      </div>
    </div>
  );
}
