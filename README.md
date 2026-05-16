# 코인 트리맵 — Cloudflare 풀스택 버전

Next.js + Cloudflare Pages + Cloudflare D1 (SQLite)

---

## 구조

```
coin-treemap/
├── app/
│   ├── page.tsx                  # 트리맵 UI
│   ├── layout.tsx                # SEO 메타태그 (한/영/일)
│   ├── sitemap.ts                # 자동 sitemap.xml
│   ├── robots.ts                 # 자동 robots.txt
│   ├── en/page.tsx               # 영어 페이지
│   ├── ja/page.tsx               # 일본어 페이지
│   └── api/
│       ├── coins/route.ts        # 시세 + D1 카테고리 합성
│       └── categories/route.ts  # 카테고리 CRUD
├── lib/db.ts                     # Cloudflare D1 쿼리
├── types/index.ts                # 타입 정의
├── sql/init.sql                  # D1 초기화 SQL (SQLite)
├── wrangler.jsonc                # Cloudflare 설정
└── open-next.config.ts           # OpenNext 어댑터 설정
```

---

## 처음 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. D1 데이터베이스 생성
```bash
npx wrangler d1 create coin-treemap-db
```
출력된 `database_id`를 `wrangler.jsonc`에 붙여넣기

### 3. DB 초기화
```bash
# 로컬 테스트용
npm run db:init

# 실제 Cloudflare D1에 적용
npm run db:init:remote
```

### 4. 로컬 개발
```bash
cp .dev.vars.example .dev.vars
npm run preview   # Cloudflare 환경으로 로컬 실행
```

### 5. 배포
```bash
npm run deploy
```
Cloudflare Pages에 자동 배포 + 도메인 연결은 Cloudflare 대시보드에서

---

## API 교체 방법

`app/api/coins/route.ts` 상단 `MARKET_API` URL만 교체:

```ts
// 현재 (CoinGecko)
const MARKET_API = 'https://api.coingecko.com/api/v3/coins/markets?...';

// 교체 후 (자체 API)
const MARKET_API = 'https://내도메인.com/api/market-data';
```

응답 포맷:
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

## D1 직접 수정 (카테고리/코인 추가)

```bash
# 카테고리 추가
npx wrangler d1 execute coin-treemap-db --remote --command \
  "INSERT INTO categories (id,label,color,\"order\",show_on_start) VALUES ('new_cat','새카테고리','#FF0000',12,0)"

# 코인 매핑 추가
npx wrangler d1 execute coin-treemap-db --remote --command \
  "INSERT OR REPLACE INTO coin_mappings (coingecko_id,symbol,name,category_id,priority) VALUES ('sui','SUI','Sui','layer1',12)"
```

---

## 기술 스택

| 역할 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 |
| 배포 | Cloudflare Pages |
| DB | Cloudflare D1 (SQLite) |
| API 런타임 | Cloudflare Edge Runtime |
| 어댑터 | @opennextjs/cloudflare |
| 스타일 | Tailwind CSS |
