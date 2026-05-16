-- ============================================================
-- Cloudflare D1 (SQLite) 초기화
-- 실행: npm run db:init          (로컬 테스트)
--       npm run db:init:remote   (실제 D1 DB)
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id            TEXT    PRIMARY KEY,
  label         TEXT    NOT NULL,
  color         TEXT    NOT NULL DEFAULT '#6B7280',
  "order"       INTEGER NOT NULL DEFAULT 99,
  show_on_start INTEGER NOT NULL DEFAULT 0,  -- 0=false, 1=true
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS coin_mappings (
  coingecko_id  TEXT    PRIMARY KEY,
  symbol        TEXT    NOT NULL,
  name          TEXT    NOT NULL,
  category_id   TEXT    NOT NULL REFERENCES categories(id),
  priority      INTEGER NOT NULL DEFAULT 99,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coin_mappings_category ON coin_mappings(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_order       ON categories("order");

-- ── 기본 카테고리 ────────────────────────────────────────
INSERT OR IGNORE INTO categories (id, label, color, "order", show_on_start) VALUES
  ('layer1',        '레이어 1',        '#2563EB', 1,  1),
  ('layer2',        '레이어 2',         '#0891B2', 2,  1),
  ('defi',          'DeFi',            '#D97706', 3,  1),
  ('stablecoin',    '스테이블코인',     '#059669', 4,  1),
  ('meme',          '밈 코인',          '#DC2626', 5,  1),
  ('ai_data',       'AI / 빅데이터',    '#7C3AED', 6,  1),
  ('nft_gaming',    'NFT / 게임',       '#EA580C', 7,  0),
  ('exchange',      '거래소 토큰',       '#1E293B', 8,  0),
  ('privacy',       '프라이버시',        '#64748B', 9,  0),
  ('rwa',           'RWA',             '#0F766E', 10, 0),
  ('infrastructure','인프라 / 오라클',  '#B45309', 11, 0),
  ('other',         '기타',            '#6B7280', 99, 0);

-- ── 기본 코인 매핑 ──────────────────────────────────────
INSERT OR IGNORE INTO coin_mappings (coingecko_id, symbol, name, category_id, priority) VALUES
  ('bitcoin',       'BTC',  'Bitcoin',       'layer1',        1),
  ('ethereum',      'ETH',  'Ethereum',      'layer1',        2),
  ('solana',        'SOL',  'Solana',        'layer1',        3),
  ('ripple',        'XRP',  'XRP',           'layer1',        4),
  ('cardano',       'ADA',  'Cardano',       'layer1',        5),
  ('avalanche-2',   'AVAX', 'Avalanche',     'layer1',        6),
  ('tron',          'TRX',  'TRON',          'layer1',        7),
  ('near',          'NEAR', 'NEAR Protocol', 'layer1',        8),
  ('aptos',         'APT',  'Aptos',         'layer1',        9),
  ('cosmos',        'ATOM', 'Cosmos',        'layer1',        10),
  ('polkadot',      'DOT',  'Polkadot',      'layer1',        11),
  ('matic-network', 'MATIC','Polygon',       'layer2',        1),
  ('arbitrum',      'ARB',  'Arbitrum',      'layer2',        2),
  ('optimism',      'OP',   'Optimism',      'layer2',        3),
  ('uniswap',       'UNI',  'Uniswap',       'defi',          1),
  ('aave',          'AAVE', 'Aave',          'defi',          2),
  ('chainlink',     'LINK', 'Chainlink',     'defi',          3),
  ('maker',         'MKR',  'Maker',         'defi',          4),
  ('lido-dao',      'LDO',  'Lido DAO',      'defi',          5),
  ('tether',        'USDT', 'Tether',        'stablecoin',    1),
  ('usd-coin',      'USDC', 'USD Coin',      'stablecoin',    2),
  ('dai',           'DAI',  'Dai',           'stablecoin',    3),
  ('dogecoin',      'DOGE', 'Dogecoin',      'meme',          1),
  ('shiba-inu',     'SHIB', 'Shiba Inu',     'meme',          2),
  ('pepe',          'PEPE', 'Pepe',          'meme',          3),
  ('fetch-ai',      'FET',  'Fetch.ai',      'ai_data',       1),
  ('render-token',  'RNDR', 'Render',        'ai_data',       2),
  ('worldcoin-wld', 'WLD',  'Worldcoin',     'ai_data',       3),
  ('axie-infinity', 'AXS',  'Axie Infinity', 'nft_gaming',    1),
  ('the-sandbox',   'SAND', 'The Sandbox',   'nft_gaming',    2),
  ('binancecoin',   'BNB',  'BNB',           'exchange',      1),
  ('okb',           'OKB',  'OKB',           'exchange',      2),
  ('monero',        'XMR',  'Monero',        'privacy',       1),
  ('filecoin',      'FIL',  'Filecoin',      'infrastructure',1),
  ('the-graph',     'GRT',  'The Graph',     'infrastructure',2),
  ('litecoin',      'LTC',  'Litecoin',      'other',         1);
