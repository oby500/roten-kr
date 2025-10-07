'use client';

import { useState, useEffect } from 'react';
import { Search, Star, Bell, Menu, X, MapPin, Calendar, Building2, TrendingUp, Clock } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportData, setSupportData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('전체사업');
  
  // 필터 상태
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedScale, setSelectedScale] = useState('전체');
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

      // 전체 데이터
      console.log('전체 데이터 로드 중...');
      const dataRes = await fetch('/api/search?q=&limit=1000');
      if (dataRes.ok) {
        const data = await dataRes.json();
        console.log('받은 데이터:', data.results?.length, '개');
        setSupportData(data.results || []);
        setDisplayData(data.results || []);
      } else {
        console.error('데이터 로드 실패:', dataRes.status);
        // 테스트용 더미 데이터
        const dummyData = [
          {
            id: 1,
            business_name: '청년창업 지원사업',
            summary: '만 39세 이하 예비창업자 및 3년 미만 창업기업 지원',
            region: '서울',
            end_date: '2024-12-31',
            status: '진행중',
            support_scale: '최대 1억원'
          },
          {
            id: 2,
            business_name: 'R&D 기술개발 지원',
            summary: '중소기업 기술개발 및 사업화 지원',
            region: '경기',
            end_date: '2024-11-30',
            status: '진행중',
            support_scale: '최대 5천만원'
          }
        ];
        setSupportData(dummyData);
        setDisplayData(dummyData);
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

  // 검색 실행
  const executeSearch = () => {
    console.log('검색 실행:', searchQuery);
    let filtered = [...supportData];

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const name = (item.business_name || item.title || '').toLowerCase();
        const summary = (item.summary || item.description || '').toLowerCase();
        return name.includes(query) || summary.includes(query);
      });
    }

    // 지역 필터
    if (selectedRegion !== '전체') {
      filtered = filtered.filter(item => 
        item.region && item.region.includes(selectedRegion)
      );
    }

    // 탭별 필터
    if (activeTab === '마감임박') {
      filtered = filtered.filter(item => {
        if (!item.end_date) return false;
        const endDate = new Date(item.end_date);
        const today = new Date();
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return daysLeft >= 0 && daysLeft <= 7;
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
    // 검색 실행
    let filtered = supportData.filter(item => {
      const name = (item.business_name || item.title || '').toLowerCase();
      const summary = (item.summary || item.description || '').toLowerCase();
      return name.includes(keyword) || summary.includes(keyword);
    });
    setDisplayData(filtered);
  };

  // 필터 변경 시
  useEffect(() => {
    executeSearch();
  }, [selectedRegion, selectedCategory, selectedScale, selectedDeadline, activeTab]);

  // 탭 변경
  const handleTabChange = (tab) => {
    console.log('탭 변경:', tab);
    setActiveTab(tab);
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
                <button 
                  onClick={() => handleTabChange('인기사업')}
                  className={`${activeTab === '인기사업' ? 'text-blue-600 font-semibold' : 'text-gray-700'} hover:text-blue-600`}
                >
                  인기사업
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                즐겨찾기 {favorites.length}
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
              {loading ? '로딩 중...' : `${displayData.length}개의 지원사업이 있습니다`}
            </p>
          </div>

          {/* 검색 바 */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="어떤 지원사업을 찾고 계신가요?"
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

      {/* 통계 카드 */}
      {stats && (
        <section className="container mx-auto px-4 -mt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-500 text-sm">전체 사업</p>
              <p className="text-2xl font-bold">{stats.total?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-500 text-sm">진행 중</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.status?.진행중?.toLocaleString() || supportData.length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-500 text-sm">검색 결과</p>
              <p className="text-2xl font-bold text-orange-600">{displayData.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-500 text-sm">즐겨찾기</p>
              <p className="text-2xl font-bold text-blue-600">{favorites.length}</p>
            </div>
          </div>
        </section>
      )}

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
            </select>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              <option value="전체">🏢 분야 전체</option>
              <option value="창업">창업</option>
              <option value="R&D">R&D</option>
              <option value="수출">수출</option>
              <option value="기술">기술개발</option>
            </select>

            <button 
              onClick={() => {
                setSelectedRegion('전체');
                setSelectedCategory('전체');
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
            검색결과 <span className="font-bold">{displayData.length}</span>건
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
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4">
                        <div className="flex justify-between items-start">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {item.status || '진행중'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                            }}
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            <Star className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-2">
                          {item.business_name || item.title || '정부지원사업'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {item.summary || item.description || '지원사업 상세 내용'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          {item.region && (
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {item.region}
                            </span>
                          )}
                          {item.end_date && (
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              ~{item.end_date}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{item.business_name || item.title}</h3>
                        <p className="text-gray-600">{item.summary || item.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          {item.region && <span>📍 {item.region}</span>}
                          {item.end_date && <span>📅 ~{item.end_date}</span>}
                        </div>
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
                  const page = i + 1;
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
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
            >
              새로고침
            </button>
          </div>
        )}
      </section>
    </div>
  );
}