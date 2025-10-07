'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, TrendingUp, Star, Bell, ChevronRight, Menu, X, Sparkles, Clock, Users, Building2 } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [supportData, setSupportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // 초기 데이터 로드
  useEffect(() => {
    loadStats();
    loadData();
    loadFavorites();
  }, []);

  // 통계 데이터 로드
  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  // 데이터 로드
  const loadData = async (query = '') => {
    setLoading(true);
    try {
      const url = query ? `/api/search?q=${encodeURIComponent(query)}` : '/api/search?q=';
      const response = await fetch(url);
      const data = await response.json();
      setSupportData(data.results || []);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setSupportData([]);
    } finally {
      setLoading(false);
    }
  };

  // 즐겨찾기 로드
  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    loadData(searchQuery);
  };

  // 즐겨찾기 토글
  const toggleFavorite = (id) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  // 인기 검색어
  const popularSearches = ['청년창업', 'R&D', '수출지원', 'IT', '제조업', '소상공인'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 glass-effect border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold gradient-text">ROTEN.KR</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-700 hover:text-primary-600 transition-colors">홈</a>
                <a href="#" className="text-gray-700 hover:text-primary-600 transition-colors">전체사업</a>
                <a href="#" className="text-gray-700 hover:text-primary-600 transition-colors">마감임박</a>
                <a href="#" className="text-gray-700 hover:text-primary-600 transition-colors">인기사업</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                <Star className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white animate-slide-up">
          <nav className="flex flex-col p-6 space-y-4">
            <a href="#" className="text-lg font-medium">홈</a>
            <a href="#" className="text-lg font-medium">전체사업</a>
            <a href="#" className="text-lg font-medium">마감임박</a>
            <a href="#" className="text-lg font-medium">인기사업</a>
          </nav>
        </div>
      )}

      {/* Hero 섹션 */}
      <section className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              정부지원사업, 한 곳에서 찾으세요
            </h2>
            <p className="text-xl opacity-90">
              {stats ? `총 ${stats.total.toLocaleString()}개의 지원사업이 당신을 기다립니다` : '로딩 중...'}
            </p>
          </div>

          {/* 검색 바 */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="어떤 지원사업을 찾고 계신가요?"
                className="w-full pl-14 pr-32 py-4 rounded-2xl text-gray-900 text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-2 rounded-xl hover:shadow-lg transition-all"
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
                onClick={() => {
                  setSearchQuery(keyword);
                  loadData(keyword);
                }}
                className="px-4 py-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-all"
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
            <div className="bg-white rounded-xl shadow-lg p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">전체 사업</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                </div>
                <Building2 className="w-10 h-10 text-primary-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">진행 중</p>
                  <p className="text-2xl font-bold text-green-600">{stats.status?.진행중?.toLocaleString() || 0}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">이번 주 마감</p>
                  <p className="text-2xl font-bold text-orange-600">24</p>
                </div>
                <Clock className="w-10 h-10 text-orange-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">신규 등록</p>
                  <p className="text-2xl font-bold text-blue-600">156</p>
                </div>
                <Sparkles className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
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
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="전체">📍 지역 전체</option>
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
              <option value="부산">부산</option>
              <option value="대구">대구</option>
              <option value="대전">대전</option>
              <option value="광주">광주</option>
              <option value="울산">울산</option>
              <option value="세종">세종</option>
            </select>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="전체">🏢 분야 전체</option>
              <option value="창업">창업</option>
              <option value="R&D">R&D</option>
              <option value="수출">수출</option>
              <option value="인력">인력</option>
              <option value="기술개발">기술개발</option>
              <option value="마케팅">마케팅</option>
              <option value="시설">시설</option>
            </select>
            
            <select className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>💰 지원규모 전체</option>
              <option>~1천만원</option>
              <option>~5천만원</option>
              <option>~1억원</option>
              <option>1억원 이상</option>
            </select>
            
            <select className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>📅 마감일 전체</option>
              <option>오늘 마감</option>
              <option>이번 주 마감</option>
              <option>이번 달 마감</option>
              <option>상시 모집</option>
            </select>

            <div className="flex gap-2">
              <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <Filter className="w-5 h-5 inline mr-2" />
                적용
              </button>
              <button className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                초기화
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 뷰 모드 선택 */}
      <section className="container mx-auto px-4 mb-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            검색결과 <span className="font-bold text-gray-900">{supportData.length}</span>건
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              카드 뷰
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'}`}
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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : supportData.length > 0 ? (
          <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {supportData.slice(0, 12).map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden card-hover ${viewMode === 'list' ? 'p-6' : ''}`}
              >
                {viewMode === 'card' ? (
                  <>
                    {/* 카드 헤더 */}
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4">
                      <div className="flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === '진행중' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status || '진행중'}
                        </span>
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          <Star className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* 카드 바디 */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {item.business_name || item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.summary || item.description || '정부지원사업입니다.'}
                      </p>

                      {/* 정보 태그 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.region && (
                          <span className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {item.region}
                          </span>
                        )}
                        {item.end_date && (
                          <span className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            ~{item.end_date}
                          </span>
                        )}
                        {item.support_scale && (
                          <span className="flex items-center text-sm text-gray-500">
                            💰 {item.support_scale}
                          </span>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <button className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors">
                          상세보기
                        </button>
                        <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          공유
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* 리스트 뷰 */
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {item.business_name || item.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === '진행중' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status || '진행중'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{item.summary || item.description || '정부지원사업입니다.'}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Star className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </button>
                      <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                        상세보기
                        <ChevronRight className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
            <p className="text-gray-400 mt-2">다른 키워드로 검색해보세요.</p>
          </div>
        )}

        {/* 더보기 버튼 */}
        {supportData.length > 12 && (
          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              더 많은 사업 보기
            </button>
          </div>
        )}
      </section>

      {/* 플로팅 버튼 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all">
          <Sparkles className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}