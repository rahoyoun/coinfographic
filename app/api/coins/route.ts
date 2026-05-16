import { NextResponse } from 'next/server';
import { getCategories, getCoinMappings } from '@/lib/db';
import type { CoinTile } from '@/types';

// ============================================================
// ★ 시세 API 교체 포인트 — 이 URL만 바꾸면 됩니다
// ============================================================
const MARKET_API =
  'https://api.coingecko.com/api/v3/coins/markets' +
  '?vs_currency=usd&order=market_cap_desc&per_page=80&page=1&sparkline=false';

// Cloudflare Edge Runtime 사용
export const runtime = 'edge';

export async function GET() {
  try {
    const [marketRes, categories, coinMappings] = await Promise.all([
      fetch(MARKET_API, { next: { revalidate: 60 } }),
      getCategories(),
      getCoinMappings(),
    ]);

    if (!marketRes.ok) throw new Error('Market API error');
    const marketData = await marketRes.json();

    const catMap     = new Map(categories.map(c => [c.id, c]));
    const coinCatMap = new Map(coinMappings.map(c => [c.coingecko_id, c.category_id]));

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
