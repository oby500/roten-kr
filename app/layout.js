import './globals.css'

export const metadata = {
  title: 'ROTEN.KR - 정부지원사업 통합 검색',
  description: '5,000개 이상의 정부지원사업을 한 곳에서 검색하고 신청하세요',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}