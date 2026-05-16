import { sql } from '@vercel/postgres';
import type { Category, CoinMapping } from '@/types';

// ── 카테고리 조회 ──────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const { rows } = await sql<Category>`
    SELECT id, label, color, "order", show_on_start
    FROM categories
    ORDER BY "order" ASC
  `;
  return rows;
}

// ── 코인 매핑 조회 ────────────────────────────────────────
export async function getCoinMappings(): Promise<CoinMapping[]> {
  const { rows } = await sql<CoinMapping>`
    SELECT coingecko_id, symbol, name, category_id, priority
    FROM coin_mappings
    ORDER BY priority ASC
  `;
  return rows;
}

// ── 카테고리 upsert ───────────────────────────────────────
export async function upsertCategory(cat: Category) {
  await sql`
    INSERT INTO categories (id, label, color, "order", show_on_start)
    VALUES (${cat.id}, ${cat.label}, ${cat.color}, ${cat.order}, ${cat.show_on_start})
    ON CONFLICT (id) DO UPDATE
      SET label         = EXCLUDED.label,
          color         = EXCLUDED.color,
          "order"       = EXCLUDED.order,
          show_on_start = EXCLUDED.show_on_start,
          updated_at    = NOW()
  `;
}

// ── 코인 매핑 upsert ──────────────────────────────────────
export async function upsertCoinMapping(coin: CoinMapping) {
  await sql`
    INSERT INTO coin_mappings (coingecko_id, symbol, name, category_id, priority)
    VALUES (${coin.coingecko_id}, ${coin.symbol}, ${coin.name}, ${coin.category_id}, ${coin.priority})
    ON CONFLICT (coingecko_id) DO UPDATE
      SET symbol      = EXCLUDED.symbol,
          name        = EXCLUDED.name,
          category_id = EXCLUDED.category_id,
          priority    = EXCLUDED.priority,
          updated_at  = NOW()
  `;
}
