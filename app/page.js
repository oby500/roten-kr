'use client';

import { useState, useEffect } from 'react';
import { Search, Star, Bell, Menu, X, MapPin, Calendar, Building2, TrendingUp, Clock, ChevronDown } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportData, setSupportData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('전체사업');
  const [showQuickStart, setShowQuickStart] = useState(true);
  
  // 필터 상태
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedStage, setSelectedStage] = useState('전체');
  const [selectedDeadline, setSelectedDeadline] = useState('전체');
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 초기 데이터 로드
  useEffect(() => {
    console.log('초기 데이터 로드 시작');
    loadAllData();
  }, []);

  // 데이터 로드 함수
  const loadAllData = async () => {
    setLoading(true);
    try {
      // 통계 데이터
      console.log('통계 데이터 로드 중...');
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
        console.log('통계 데이터:', statsData);
      }

      // 전체 데이터 - limit 제거하여 전체 데이터 가져오기
      console.log('전체 데이터 로드 중...');
      const dataRes = await fetch('/api/search?q=');
      if (dataRes.ok) {
        const data = await dataRes.json();
        console.log('받은 데이터:', data.results?.length, '개');
        console.log('API 메시지:', data.message);
        setSupportData(data.results || []);
        setDisplayData(data.results || []);
      } else {
        console.error('데이터 로드 실패:', dataRes.status);
      }
    } catch (error) {
      console.error('데이터 로드 에러:', error);
    } finally {
      setLoading(false);
    }

    // 즐겨찾기 로드
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  // 빠른 시작 옵션 선택
  const handleQuickStart = async (option) => {
    setShowQuickStart(false);
    setLoading(true);
    
    let filtered = [...supportData];
    
    switch(option) {
      case 'startup':
        setSelectedStage('예비창업');
        filtered = supportData.filter(item => 
          item.targets?.includes('예비창업') || 
          item.targets?.includes('스타트업') ||
          item.business_name?.includes('창업')
        );
        break;
      case 'growth':
        setSelectedCategory('기업성장');
        filtered = supportData.filter(item => 
          item.targets?.includes('중소기업') ||
          item.support_types?.includes('자금지원') ||
          item.business_name?.includes('성장')
        );
        break;
      case 'rd':
        filtered = supportData.filter(item => 
          item.support_types?.includes('R&D') ||
          item.business_name?.includes('R&D') ||
          item.business_name?.includes('기술') ||
          item.business_name?.includes('연구')
        );
        break;
      case 'export':
        filtered = supportData.filter(item => 
          item.support_types?.includes('마케팅/판로') ||
          item.business_name?.includes('수출') ||
          item.business_name?.includes('해외')
        );
        break;
    }
    
    setDisplayData(filtered);
    setLoading(false);
  };

  // 검색 실행
  const executeSearch = () => {
    console.log('검색 실행:', searchQuery);
    let filtered = [...supportData];

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const name = (item.business_name || item.title || '').toLowerCase();
        const summary = (item.full_summary || item.description || '').toLowerCase();
        const org = (item.organization || '').toLowerCase();
        return name.includes(query) || summary.includes(query) || org.includes(query);
      });
    }

    // 지역 필터
    if (selectedRegion !== '전체') {
      filtered = filtered.filter(item => 
        item.region && item.region.includes(selectedRegion)
      );
    }

    // 단계 필터
    if (selectedStage !== '전체') {
      filtered = filtered.filter(item => {
        if (selectedStage === '예비창업') {
          return item.targets?.includes('예비창업');
        } else if (selectedStage === '1년차') {
          return item.targets?.includes('1년차') || item.targets?.includes('스타트업');
        } else if (selectedStage === '2년차') {
          return item.targets?.includes('2년차') || item.targets?.includes('스타트업');
        } else if (selectedStage === '3년차이상') {
          return item.targets?.includes('3년차') || item.targets?.includes('중소기업');
        }
        return true;
      });
    }

    // 마감일 필터
    if (selectedDeadline !== '전체') {
      filtered = filtered.filter(item => {
        const days = item.days_remaining;
        if (selectedDeadline === '긴급' && days !== null) return days >= 0 && days <= 3;
        if (selectedDeadline === '이번주' && days !== null) return days >= 0 && days <= 7;
        if (selectedDeadline === '이번달' && days !== null) return days >= 0 && days <= 30;
        return true;
      });
    }

    // 탭별 필터
    if (activeTab === '마감임박') {
      filtered = filtered.filter(item => {
        const days = item.days_remaining;
        return days !== null && days >= 0 && days <= 7;
      });
    }

    console.log('필터링 결과:', filtered.length, '개');
    setDisplayData(filtered);
    setCurrentPage(1);
  };

  // 검색 폼 제출
  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch();
  };

  // 인기 검색어 클릭
  const handlePopularSearch = (keyword) => {
    setSearchQuery(keyword);
    setShowQuickStart(false);
    // 검색 실행
    let filtered = supportData.filter(item => {
      const name = (item.business_name || item.title || '').toLowerCase();
      const summary = (item.full_summary || item.description || '').toLowerCase();
      return name.includes(keyword) || summary.includes(keyword);
    });
    setDisplayData(filtered);
  };

  // 필터 변경 시
  useEffect(() => {
    if (supportData.length > 0) {
      executeSearch();
    }
  }, [selectedRegion, selectedStage, selectedDeadline, activeTab]);

  // 탭 변경
  const handleTabChange = (tab) => {
    console.log('탭 변경:', tab);
    setActiveTab(tab);
    if (tab === '홈') {
      setShowQuickStart(true);
    } else {
      setShowQuickStart(false);
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = (id) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  // 상세 페이지 이동
  const goToDetail = (item) => {
    window.location.href = `/detail?id=${item.id}`;
  };

  // 페이지네이션 데이터
  const getPaginatedData = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayData.slice(start, start + itemsPerPage);
  };

  const totalPages = Math.ceil(displayData.length / itemsPerPage);

  const popularSearches = ['청년창업', 'R&D', '수출지원', 'IT', '제조업', '소상공인'];

  // D-day 색상 반환
  const getDdayColor = (days) => {
    if (days === null) return 'bg-gray-100 text-gray-600';
    if (days <= 3) return 'bg-red-500 text-white';
    if (days <= 7) return 'bg-orange-500 text-white';
    if (days <= 14) return 'bg-yellow-500 text-white';
    if (days <= 30) return 'bg-green-500 text-white';
    return 'bg-blue-500 text-white';
  };

  // D-day 텍스트 반환
  const getDdayText = (days) => {
    if (days === null) return '상시';
    if (days === 0) return '오늘 마감';
    if (days < 0) return '마감';
    return `D-${days}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">ROTEN.KR</h1>
              <nav className="hidden md:flex space-x-6">
                <button 
                  onClick={() => handleTabChange('홈')}
                  className={`${activeTab === '홈' ? 'text-blue-600 font-semibold' : 'text-gray-700'} hover:text-blue-600`}
                >
                  홈
                </button>
                <button 
                  onClick={() => handleTabChange('전체사업')}
                  className={`${activeTab === '전체사업' ? 'text-blue-600 font-semibold' : 'text-gray-700'} hover:text-blue-600`}
                >
                  전체사업
                </button>
                <button 
                  onClick={() => handleTabChange('마감임박')}
                  className={`${activeTab === '마감임박' ? 'text-blue-600 font-semibold' : 'text-gray-700'} hover:text-blue-600`}
                >
                  마감임박
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                전체 {supportData.length}개 | 즐겨찾기 {favorites.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero 섹션 */}
      <section className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">
              정부지원사업, 한 곳에서 찾으세요
            </h2>
            <p className="text-xl">
              {loading ? '로딩 중...' : `${supportData.length}개의 활성 지원사업`}
            </p>
          </div>

          {/* 검색 바 */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowQuickStart(false);
                }}
                placeholder="기업명, 사업명, 키워드로 검색하세요"
                className="w-full px-12 py-4 rounded-2xl text-gray-900 text-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-8 py-2 rounded-xl hover:bg-blue-700"
              >
                검색
              </button>
            </div>
          </form>

          {/* 인기 검색어 */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {popularSearches.map((keyword) => (
              <button
                key={keyword}
                onClick={() => handlePopularSearch(keyword)}
                className="px-4 py-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30"
              >
                #{keyword}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 빠른 시작 (홈 탭에서만) */}
      {showQuickStart && activeTab === '홈' && (
        <section className="container mx-auto px-4 py-8">
          <h3 className="text-xl font-bold mb-4">어떤 지원을 찾으시나요?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickStart('startup')}
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold">창업 지원금</div>
              <div className="text-sm text-gray-500">예비창업자·초기기업</div>
            </button>
            <button
              onClick={() => handleQuickStart('growth')}
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-3xl mb-2">📈</div>
              <div className="font-semibold">기업 성장지원</div>
              <div className="text-sm text-gray-500">스케일업·자금지원</div>
            </button>
            <button
              onClick={() => handleQuickStart('rd')}
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-3xl mb-2">🔬</div>
              <div className="font-semibold">R&D/기술지원</div>
              <div className="text-sm text-gray-500">연구개발·기술사업화</div>
            </button>
            <button
              onClick={() => handleQuickStart('export')}
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-3xl mb-2">🌐</div>
              <div className="font-semibold">수출/해외진출</div>
              <div className="text-sm text-gray-500">글로벌·마케팅지원</div>
            </button>
          </div>
        </section>
      )}

      {/* 통계 카드 */}
      <section className="container mx-auto px-4 -mt-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 text-sm">전체 사업</p>
            <p className="text-2xl font-bold">{supportData.length.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 text-sm">마감임박 (7일)</p>
            <p className="text-2xl font-bold text-orange-600">
              {supportData.filter(item => item.days_remaining >= 0 && item.days_remaining <= 7).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 text-sm">검색 결과</p>
            <p className="text-2xl font-bold text-green-600">{displayData.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 text-sm">즐겨찾기</p>
            <p className="text-2xl font-bold text-blue-600">{favorites.length}</p>
          </div>
        </div>
      </section>

      {/* 필터 바 */}
      <section className="container mx-auto px-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              <option value="전체">📍 지역 전체</option>
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
              <option value="부산">부산</option>
              <option value="대구">대구</option>
              <option value="대전">대전</option>
              <option value="광주">광주</option>
              <option value="전국">전국</option>
            </select>
            
            <select 
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              <option value="전체">🏢 기업 단계</option>
              <option value="예비창업">예비창업</option>
              <option value="1년차">1년차</option>
              <option value="2년차">2년차</option>
              <option value="3년차이상">3년차 이상</option>
            </select>

            <select 
              value={selectedDeadline}
              onChange={(e) => setSelectedDeadline(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              <option value="전체">⏰ 마감일</option>
              <option value="긴급">긴급 (3일 이내)</option>
              <option value="이번주">이번주 마감</option>
              <option value="이번달">이번달 마감</option>
            </select>

            <button 
              onClick={() => {
                setSelectedRegion('전체');
                setSelectedStage('전체');
                setSelectedDeadline('전체');
                setSearchQuery('');
                setDisplayData(supportData);
              }}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              초기화
            </button>
          </div>
        </div>
      </section>

      {/* 뷰 모드 선택 */}
      <section className="container mx-auto px-4 mb-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            검색결과 <span className="font-bold text-black">{displayData.length}</span>건
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              카드 뷰
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              리스트 뷰
            </button>
          </div>
        </div>
      </section>

      {/* 검색 결과 */}
      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : displayData.length > 0 ? (
          <>
            <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {getPaginatedData().map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => goToDetail(item)}
                >
                  {viewMode === 'card' ? (
                    <>
                      {/* 상단 태그 영역 */}
                      <div className="p-4 border-b">
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDdayColor(item.days_remaining)}`}>
                            {getDdayText(item.days_remaining)}
                          </span>
                          {item.region && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              📍 {item.region}
                            </span>
                          )}
                          {item.support_types?.slice(0, 2).map((type, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* 콘텐츠 영역 */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold flex-1 line-clamp-2">
                            {item.business_name || item.title || '정부지원사업'}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-yellow-500"
                          >
                            <Star className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                          </button>
                        </div>
                        
                        {/* 3줄 핵심 요약 */}
                        <div className="space-y-2 text-sm">
                          {item.summary_points?.map((point, idx) => (
                            <div key={idx} className="flex items-start">
                              <span className="mr-2">{point.icon}</span>
                              <div className="flex-1">
                                <span className="font-medium text-gray-700">{point.label}:</span>
                                <span className="text-gray-600 ml-1">{point.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-500">
                            {item.organization}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDdayColor(item.days_remaining)}`}>
                            {getDdayText(item.days_remaining)}
                          </span>
                          {item.region && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              📍 {item.region}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold">{item.business_name || item.title}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          {item.summary_points?.map((point, idx) => (
                            <div key={idx}>
                              {point.icon} {point.label}: {point.text}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{item.organization}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className="p-2"
                      >
                        <Star className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  이전
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page ? 'bg-blue-500 text-white' : 'border'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2 py-2">...</span>
                )}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    {totalPages}
                  </button>
                )}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
            <p className="text-gray-400 mt-2">다른 키워드로 검색해보세요</p>
            <button 
              onClick={() => {
                setSelectedRegion('전체');
                setSelectedStage('전체');
                setSelectedDeadline('전체');
                setSearchQuery('');
                setDisplayData(supportData);
              }}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
            >
              필터 초기화
            </button>
          </div>
        )}
      </section>
    </div>
  );
}