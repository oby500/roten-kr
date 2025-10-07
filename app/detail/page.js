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
      // 실제 API 호출
      const response = await fetch(`/api/announcement/${businessId}`);
      const result = await response.json();

      if (result.success && result.data) {
        setBusiness(result.data);
      } else {
        console.error('상세 정보 로드 실패:', result.error);
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
  const getSupportTypeColor = (type) => {
    if (type.includes('자금')) return 'bg-green-100 text-green-700';
    if (type.includes('R&D')) return 'bg-blue-100 text-blue-700';
    if (type.includes('교육') || type.includes('컨설팅')) return 'bg-purple-100 text-purple-700';
    if (type.includes('시설') || type.includes('공간')) return 'bg-yellow-100 text-yellow-700';
    if (type.includes('마케팅') || type.includes('판로')) return 'bg-pink-100 text-pink-700';
    if (type.includes('인력')) return 'bg-indigo-100 text-indigo-700';
    if (type.includes('창업')) return 'bg-teal-100 text-teal-700';
    if (type.includes('혁신')) return 'bg-cyan-100 text-cyan-700';
    if (type.includes('성장')) return 'bg-lime-100 text-lime-700';
    return 'bg-gray-100 text-gray-600';
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
                    {/* D-day 배지 */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      business.days_remaining === null
                        ? 'bg-gray-100 text-gray-600'
                        : business.days_remaining <= 3
                        ? 'bg-red-500 text-white'
                        : business.days_remaining <= 7
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {business.days_remaining === null
                        ? '상시'
                        : business.days_remaining === 0
                        ? 'D-Day'
                        : business.days_remaining < 0
                        ? '마감'
                        : `D-${business.days_remaining}`}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      business.status === '진행중'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {business.status || '진행중'}
                    </span>

                    {/* 지역 태그 */}
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      📍 {business.region || '전국'}
                    </span>

                    {/* 지원 유형 태그 */}
                    {business.support_types && business.support_types.length > 0 ? (
                      business.support_types.slice(0, 2).map((type, idx) => (
                        <span key={idx} className={`px-3 py-1 rounded-full text-sm font-medium ${getSupportTypeColor(type)}`}>
                          {type}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        지원사업
                      </span>
                    )}
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

            {/* AI 요약 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                🤖 AI 간단 요약
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {business.simple_summary || '요약 정보가 없습니다'}
              </p>
            </div>

            {/* 상세 내용 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 상세 내용</h2>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {business.detailed_summary || '상세 내용이 없습니다'}
              </div>
            </div>

            {/* 첨부파일 */}
            {business.attachment_urls && business.attachment_urls.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📎 첨부파일</h2>
                <div className="space-y-2">
                  {business.attachment_urls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-primary-500" />
                        <span className="text-sm font-medium">첨부파일 {idx + 1}</span>
                      </div>
                      <span className="text-xs text-gray-500">다운로드</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

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
            <div className={`rounded-xl p-6 text-white ${
              business.days_remaining !== null && business.days_remaining <= 3
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : business.days_remaining !== null && business.days_remaining <= 7
                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm">마감까지</p>
                  <p className="text-2xl font-bold">
                    {business.days_remaining === null
                      ? '상시'
                      : business.days_remaining === 0
                      ? '오늘 마감'
                      : business.days_remaining < 0
                      ? '마감'
                      : `D-${business.days_remaining}`}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-white/50" />
              </div>
              <a
                href={business.apply_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                style={{ color: business.days_remaining !== null && business.days_remaining <= 3 ? '#ef4444' : business.days_remaining !== null && business.days_remaining <= 7 ? '#f97316' : '#3b82f6' }}
              >
                온라인 신청하기
              </a>
              <p className="text-xs text-white/80 text-center mt-3">
                * 신청 전 자격요건을 확인하세요
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}