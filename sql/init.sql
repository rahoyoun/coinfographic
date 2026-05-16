-- ============================================================
-- 실행 방법:
--   Vercel Postgres 대시보드 쿼리창 또는
--   psql $POSTGRES_URL < sql/init.sql
-- ============================================================

-- 카테고리 그룹 테이블
CREATE TABLE IF NOT EXISTS categories (
  id            VARCHAR(50)  PRIMARY KEY,
  label         VARCHAR(100) NOT NULL,
  color         VARCHAR(7)   NOT NULL DEFAULT '#6B7280',
  "order"       INT          NOT NULL DEFAULT 99,
  show_on_start BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 코인 매핑 테이블
CREATE TABLE IF NOT EXISTS coin_mappings (
  coingecko_id  VARCHAR(100) PRIMARY KEY,
  symbol        VARCHAR(20)  NOT NULL,
  name          VARCHAR(100) NOT NULL,
  category_id   VARCHAR(50)  NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  priority      INT          NOT NULL DEFAULT 99,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_coin_mappings_category ON coin_mappings(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_order       ON categories("order");

-- ── 기본 카테고리 데이터 삽입 ────────────────────────────
INSERT INTO categories (id, label, color, "order", show_on_start) VALUES
  ('layer1',        '레이어 1',        '#2563EB', 1,  TRUE),
  ('layer2',        '레이어 2',         '#0891B2', 2,  TRUE),
  ('defi',          'DeFi',            '#D97706', 3,  TRUE),
  ('stablecoin',    '스테이블코인',     '#059669', 4,  TRUE),
  ('meme',          '밈 코인',          '#DC2626', 5,  TRUE),
  ('ai_data',       'AI / 빅데이터',    '#7C3AED', 6,  TRUE),
  ('nft_gaming',    'NFT / 게임',       '#EA580C', 7,  FALSE),
  ('exchange',      '거래소 토큰',       '#1E293B', 8,  FALSE),
  ('privacy',       '프라이버시',        '#64748B', 9,  FALSE),
  ('rwa',           'RWA',             '#0F766E', 10, FALSE),
  ('infrastructure','인프라 / 오라클',  '#B45309', 11, FALSE),
  ('other',         '기타',            '#6B7280', 99, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ── 기본 코인 매핑 데이터 삽입 ──────────────────────────
INSERT INTO coin_mappings (coingecko_id, symbol, name, category_id, priority) VALUES
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
  ('litecoin',      'LTC',  'Litecoin',      'other',         1)
ON CONFLICT (coingecko_id) DO NOTHING;
