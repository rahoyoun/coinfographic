# 코인 트리맵

실시간 코인 시가총액 트리맵. Next.js + Vercel Postgres 기반.

---

## 프로젝트 구조

```
coin-treemap/
├── app/
│   ├── page.tsx                  # 메인 트리맵 UI
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── coins/route.ts        # 시세 + DB 카테고리 합성 API
│       └── categories/route.ts  # 카테고리 CRUD API
├── lib/
│   └── db.ts                     # Vercel Postgres 쿼리 헬퍼
├── types/
│   └── index.ts                  # 공통 타입 정의
├── sql/
│   └── init.sql                  # DB 초기화 SQL
└── .env.local.example            # 환경변수 예시
```

---

## 로컬 개발 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.local.example .env.local
# .env.local에 Vercel Postgres 연결 정보 입력

# 3. DB 초기화 (Vercel Postgres 대시보드 쿼리창에 sql/init.sql 붙여넣기)

# 4. 개발 서버 실행
npm run dev
```

---

## Vercel 배포

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 배포
vercel

# 3. Vercel 대시보드 → Storage → Postgres DB 생성
#    → 프로젝트에 연결하면 환경변수 자동 주입
```

---

## API 교체 방법

나중에 직접 만든 시세 API로 바꿀 때:

`app/api/coins/route.ts` 상단 `MARKET_API` URL만 교체

```ts
// 현재 (CoinGecko)
const MARKET_API = 'https://api.coingecko.com/api/v3/coins/markets?...';

// 교체 후 (자체 API)
const MARKET_API = 'https://내도메인.com/api/market-data';
```

응답 포맷은 아래를 맞춰주면 됩니다:

```json
[
  {
    "id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "current_price": 62000,
    "market_cap": 1220000000000,
    "price_change_percentage_24h": 1.2,
    "total_volume": 28000000000
  }
]
```

---

## DB 스키마

### categories
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(50) | 고유 키 (예: layer1) |
| label | VARCHAR(100) | 화면 표시 이름 |
| color | VARCHAR(7) | 타일 색상 (#2563EB) |
| order | INT | 버튼 정렬 순서 |
| show_on_start | BOOLEAN | 초기 화면 노출 여부 |

### coin_mappings
| 컬럼 | 타입 | 설명 |
|------|------|------|
| coingecko_id | VARCHAR(100) | CoinGecko 코인 ID |
| symbol | VARCHAR(20) | 티커 (BTC) |
| name | VARCHAR(100) | 코인 이름 |
| category_id | VARCHAR(50) | categories.id 참조 |
| priority | INT | 그룹 내 정렬 우선순위 |
