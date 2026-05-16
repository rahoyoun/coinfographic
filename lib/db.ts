import type { Category, CoinMapping } from '@/types';
import { getRequestContext } from '@cloudflare/next-on-pages';

interface Env { DB: D1Database; }

function getDB(): D1Database {
  const { env } = getRequestContext();
  return (env as unknown as Env).DB;
}

// ── 카테고리 조회 ──────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const db = getDB();
  const { results } = await db
    .prepare('SELECT id, label, color, "order", show_on_start FROM categories ORDER BY "order" ASC')
    .all<Category>();
  return results.map(r => ({ ...r, show_on_start: Boolean(r.show_on_start) }));
}

// ── 코인 매핑 조회 ────────────────────────────────────────
export async function getCoinMappings(): Promise<CoinMapping[]> {
  const db = getDB();
  const { results } = await db
    .prepare('SELECT coingecko_id, symbol, name, category_id, priority FROM coin_mappings ORDER BY priority ASC')
    .all<CoinMapping>();
  return results;
}

// ── 카테고리 upsert ───────────────────────────────────────
export async function upsertCategory(cat: Category): Promise<void> {
  const db = getDB();
  await db
    .prepare(`
      INSERT INTO categories (id, label, color, "order", show_on_start, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        label = excluded.label, color = excluded.color,
        "order" = excluded."order", show_on_start = excluded.show_on_start,
        updated_at = datetime('now')
    `)
    .bind(cat.id, cat.label, cat.color, cat.order, cat.show_on_start ? 1 : 0)
    .run();
}

// ── 코인 매핑 upsert ──────────────────────────────────────
export async function upsertCoinMapping(coin: CoinMapping): Promise<void> {
  const db = getDB();
  await db
    .prepare(`
      INSERT INTO coin_mappings (coingecko_id, symbol, name, category_id, priority, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(coingecko_id) DO UPDATE SET
        symbol = excluded.symbol, name = excluded.name,
        category_id = excluded.category_id, priority = excluded.priority,
        updated_at = datetime('now')
    `)
    .bind(coin.coingecko_id, coin.symbol, coin.name, coin.category_id, coin.priority)
    .run();
}
