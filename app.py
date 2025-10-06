from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Roten.kr API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    return HTMLResponse("""
    <html>
        <head>
            <title>Roten.kr - 정부지원사업 통합 검색</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100">
            <div class="container mx-auto px-4 py-16">
                <h1 class="text-4xl font-bold text-center mb-8">
                    🎯 Roten.kr
                </h1>
                <p class="text-center text-xl text-gray-600 mb-8">
                    정부지원사업 통합 검색 플랫폼
                </p>
                <div class="text-center">
                    <p class="mb-4">🚀 서비스 준비 중입니다...</p>
                    <a href="/api/test" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                        API 테스트
                    </a>
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
        "version": "1.0.0"
    }

@app.get("/api/stats")
async def stats():
    return {
        "total": 5646,
        "ongoing": 1983,
        "closing_soon": 61,
        "sources": {
            "kstartup": 1527,
            "bizinfo": 4119
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)