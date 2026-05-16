// 카테고리 그룹
export interface Category {
  id: string;         // 'layer1', 'defi' ...
  label: string;      // '레이어 1', 'DeFi' ...
  color: string;      // '#2563EB'
  order: number;      // 정렬 순서
  show_on_start: boolean; // 초기 화면 표시 여부
}

// 코인 매핑 (DB)
export interface CoinMapping {
  coingecko_id: string;  // 'bitcoin'
  symbol: string;        // 'BTC'
  name: string;          // 'Bitcoin'
  category_id: string;   // 'layer1'
  priority: number;      // 그룹 내 정렬
}

// CoinGecko API 응답 / 자체 API 응답 포맷
export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

// 프론트에서 사용하는 합성 타입
export interface CoinTile extends CoinMarket {
  category_id: string;
  category_label: string;
  category_color: string;
}
