import { NextResponse } from 'next/server';
import { getCategories, getCoinMappings } from '@/lib/db';
import type { CoinTile } from '@/types';

// ============================================================
// ★ 시세 API 교체 포인트
// 나중에 직접 만든 API로 바꿀 때 이 URL만 교체하면 됩니다.
//
// 응답 포맷 (배열):
// [
//   {
//     id: "bitcoin",
//     symbol: "BTC",
//     name: "Bitcoin",
//     current_price: 62000,
//     market_cap: 1220000000000,
//     price_change_percentage_24h: 1.2,
//     total_volume: 28000000000
//   }, ...
// ]
// ============================================================
const MARKET_API =
  'https://api.coingecko.com/api/v3/coins/markets' +
  '?vs_currency=usd&order=market_cap_desc&per_page=80&page=1&sparkline=false';

// Vercel Edge Cache: 60초 캐시
export const revalidate = 60;

export async function GET() {
  try {
    // 1. 시세 데이터 + DB 설정 병렬 fetch
    const [marketRes, categories, coinMappings] = await Promise.all([
      fetch(MARKET_API, { next: { revalidate: 60 } }),
      getCategories(),
      getCoinMappings(),
    ]);

    if (!marketRes.ok) throw new Error('Market API error');
    const marketData = await marketRes.json();

    // 2. 카테고리 맵 (id → category)
    const catMap = new Map(categories.map(c => [c.id, c]));

    // 3. 코인 매핑 맵 (coingecko_id → category_id)
    const coinCatMap = new Map(coinMappings.map(c => [c.coingecko_id, c.category_id]));

    // 4. 시세 + 카테고리 합성
    const tiles: CoinTile[] = marketData.map((coin: any) => {
      const categoryId = coinCatMap.get(coin.id) ?? 'other';
      const category   = catMap.get(categoryId) ?? {
        label: '기타', color: '#6B7280', id: 'other', order: 99, show_on_start: false,
      };
      return {
        ...coin,
        category_id:    category.id,
        category_label: category.label,
        category_color: category.color,
      };
    });

    return NextResponse.json({
      coins:      tiles,
      categories: categories,
      updated_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[/api/coins]', err);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
