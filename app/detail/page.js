'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Building2, Users, Phone, Mail, Globe, FileText, Share2, Star, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function DetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadBusinessDetail(id);
      checkFavorite(id);
    }
  }, [id]);

  const loadBusinessDetail = async (businessId) => {
    setLoading(true);
    try {
      // API 호출 시뮬레이션 - 실제로는 /api/business/[id] 엔드포인트 필요
      const response = await fetch(`/api/search?q=${businessId}`);
      const data = await response.json();
      
      // 임시로 첫 번째 결과를 상세 정보로 사용
      if (data.results && data.results.length > 0) {
        setBusiness(data.results[0]);
      }
    } catch (error) {
      console.error('상세 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = (businessId) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(businessId));
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    const shareData = {
      title: business?.business_name || '정부지원사업',
      text: `${business?.business_name} - 정부지원사업 정보`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // 클립보드에 복사
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다!');
      }
    } catch (error) {
      console.error('공유 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">사업 정보를 찾을 수 없습니다.</p>
        <a href="/" className="mt-4 text-primary-600 hover:underline">목록으로 돌아가기</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 네비게이션 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </a>
              <h1 className="text-xl font-bold text-gray-900">사업 상세정보</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
              >
                <Star className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 주요 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 사업명 및 상태 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      business.status === '진행중' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {business.status || '진행중'}
                    </span>
                    {business.is_popular && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        인기
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    {business.business_name || business.title}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {business.summary || business.description || '정부지원사업입니다.'}
                  </p>
                </div>
              </div>

              {/* 주요 정보 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div>
                  <p className="text-gray-500 text-sm mb-1">지역</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-primary-500" />
                    {business.region || '전국'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">접수기간</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-primary-500" />
                    {business.end_date ? `~${business.end_date}` : '상시'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">지원규모</p>
                  <p className="font-semibold text-gray-900">
                    💰 {business.support_scale || '협의'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">신청대상</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-1 text-primary-500" />
                    {business.target || '중소기업'}
                  </p>
                </div>
              </div>
            </div>

            {/* 상세 내용 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">사업 상세내용</h2>
              <div className="prose max-w-none text-gray-600">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">📌 사업목적</h3>
                    <p>{business.purpose || '중소기업의 경쟁력 강화 및 혁신성장 지원을 통한 일자리 창출과 경제 활성화'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">📋 지원내용</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>사업화 자금 지원 (최대 {business.support_scale || '1억원'})</li>
                      <li>기술개발 및 R&D 지원</li>
                      <li>마케팅 및 판로개척 지원</li>
                      <li>전문가 멘토링 및 컨설팅</li>
                      <li>네트워킹 및 협력 기회 제공</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">✅ 신청자격</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>사업자등록증을 보유한 중소기업</li>
                      <li>창업 후 7년 이내 기업 (업종별 상이)</li>
                      <li>신청일 기준 정상 영업 중인 기업</li>
                      <li>국세 및 지방세 체납이 없는 기업</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">📝 신청방법</h3>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>온라인 신청서 작성 및 제출</li>
                      <li>구비서류 업로드
                        <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                          <li>사업계획서</li>
                          <li>재무제표</li>
                          <li>사업자등록증</li>
                          <li>기타 증빙서류</li>
                        </ul>
                      </li>
                      <li>서류심사 및 현장실태조사</li>
                      <li>선정평가위원회 심의</li>
                      <li>최종 선정 및 협약체결</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* 유의사항 */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-amber-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">유의사항</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 동일 사업 중복 신청 불가</li>
                    <li>• 제출된 서류는 반환되지 않음</li>
                    <li>• 허위 정보 기재 시 선정 취소 및 제재 조치</li>
                    <li>• 선정 후 의무사항 미이행 시 지원금 환수</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="space-y-6">
            {/* 담당자 정보 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">담당자 정보</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Building2 className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">담당기관</p>
                    <p className="font-medium">{business.organization || '한국산업기술진흥원'}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-medium">{business.phone || '1577-8088'}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="font-medium text-sm">{business.email || 'support@kiat.or.kr'}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Globe className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">홈페이지</p>
                    <a href={business.website || '#'} target="_blank" rel="noopener noreferrer" 
                       className="font-medium text-primary-600 hover:underline">
                      바로가기
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 신청 버튼 */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm">마감까지</p>
                  <p className="text-2xl font-bold">D-14</p>
                </div>
                <Clock className="w-10 h-10 text-white/50" />
              </div>
              <button className="w-full bg-white text-primary-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                온라인 신청하기
              </button>
              <p className="text-xs text-white/80 text-center mt-3">
                * 신청 전 자격요건을 확인하세요
              </p>
            </div>

            {/* 관련 서류 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">관련 서류</h2>
              <div className="space-y-2">
                <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-primary-500" />
                    <span className="text-sm font-medium">사업 공고문</span>
                  </div>
                  <span className="text-xs text-gray-500">PDF</span>
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-primary-500" />
                    <span className="text-sm font-medium">신청서 양식</span>
                  </div>
                  <span className="text-xs text-gray-500">HWP</span>
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-primary-500" />
                    <span className="text-sm font-medium">사업계획서 양식</span>
                  </div>
                  <span className="text-xs text-gray-500">PPT</span>
                </a>
              </div>
            </div>

            {/* 비슷한 사업 추천 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">비슷한 지원사업</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <a key={item} href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-sm text-gray-900 mb-1">청년창업 사관학교</p>
                    <p className="text-xs text-gray-500">중소벤처기업부 • ~12.31</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}