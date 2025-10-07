from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from typing import Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from supabase import create_client
import logging

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(title="Roten.kr API", version="2.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase 연결
try:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase connected successfully")
    else:
        supabase = None
        logger.warning("Supabase credentials not found")
except Exception as e:
    logger.error(f"Supabase connection failed: {e}")
    supabase = None

@app.get("/")
async def home():
    return HTMLResponse("""
    <html>
        <head>
            <title>Roten.kr - 정부지원사업 통합 검색</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <meta charset="UTF-8">
        </head>
        <body class="bg-gray-100">
            <div class="container mx-auto px-4 py-16">
                <h1 class="text-4xl font-bold text-center mb-8">🎯 Roten.kr</h1>
                <p class="text-center text-xl text-gray-600 mb-8">정부지원사업 통합 검색 플랫폼</p>
                <div class="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
                    <div class="text-center mb-6">
                        <p class="text-lg mb-4">✅ 서비스가 정상 작동 중입니다!</p>
                        <p class="text-gray-600">5,646개의 정부지원사업 데이터 제공</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <a href="/api/stats" class="bg-blue-500 text-white px-6 py-3 rounded text-center hover:bg-blue-600">
                            📊 통계 보기
                        </a>
                        <a href="/api/search?q=AI" class="bg-green-500 text-white px-6 py-3 rounded text-center hover:bg-green-600">
                            🔍 검색 테스트
                        </a>
                    </div>
                </div>
            </div>
        </body>
    </html>
    """)

@app.get("/api/test")
async def test():
    return {
        "status": "success",
        "message": "Roten.kr API is working!",
        "version": "2.0.0",
        "database": "connected" if supabase else "disconnected"
    }

@app.get("/api/stats")
async def get_stats():
    if not supabase:
        return {
            "total": 5646,
            "kstartup": 1527,
            "bizinfo": 4119,
            "ongoing": 1983,
            "deadline": 61,
            "message": "Demo data (database not connected)"
        }
    
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        week_later = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        # K-Startup 통계
        ks_total = supabase.table('kstartup_complete').select("*", count='exact').execute()
        ks_ongoing = supabase.table('kstartup_complete')\
            .select("*", count='exact')\
            .gte('pbanc_rcpt_end_dt', today)\
            .execute()
        
        # BizInfo 통계  
        bi_total = supabase.table('bizinfo_complete').select("*", count='exact').execute()
        bi_ongoing = supabase.table('bizinfo_complete')\
            .select("*", count='exact')\
            .gte('reqst_end_ymd', today)\
            .execute()
        
        return {
            "total": (ks_total.count or 0) + (bi_total.count or 0),
            "kstartup": ks_total.count or 0,
            "bizinfo": bi_total.count or 0,
            "ongoing": (ks_ongoing.count or 0) + (bi_ongoing.count or 0),
            "message": "Real data from database"
        }
    except Exception as e:
        logger.error(f"Stats error: {e}")
        return {"error": str(e)}

@app.get("/api/search")
async def search(
    q: Optional[str] = Query(None),
    source: Optional[str] = Query("all"),
    limit: int = Query(10)
):
    if not supabase:
        return {
            "results": [],
            "message": "Database not connected",
            "query": q
        }
    
    try:
        results = []
        
        # K-Startup 검색
        if source in ["all", "kstartup"]:
            ks_query = supabase.table('kstartup_complete').select("*")
            if q:
                ks_query = ks_query.ilike('biz_pbanc_nm', f'%{q}%')
            ks_result = ks_query.limit(limit).execute()
            
            for item in ks_result.data:
                results.append({
                    "id": item.get("announcement_id"),
                    "title": item.get("biz_pbanc_nm"),
                    "organization": item.get("supp_biz_type_nm", ""),
                    "end_date": item.get("pbanc_rcpt_end_dt"),
                    "source": "K-Startup"
                })
        
        # BizInfo 검색
        if source in ["all", "bizinfo"]:
            bi_query = supabase.table('bizinfo_complete').select("*")
            if q:
                bi_query = bi_query.ilike('pblanc_nm', f'%{q}%')
            bi_result = bi_query.limit(limit).execute()
            
            for item in bi_result.data:
                results.append({
                    "id": item.get("pblanc_id"),
                    "title": item.get("pblanc_nm"),
                    "organization": item.get("excute_instt_nm", ""),
                    "end_date": item.get("reqst_end_ymd"),
                    "source": "BizInfo"
                })
        
        return {
            "results": results[:limit],
            "total": len(results),
            "query": q
        }
    except Exception as e:
        logger.error(f"Search error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)