'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { CoinTile, Category } from '@/types';

/* ── Squarify 알고리즘 ─────────────────────────────────── */
interface Item { coin: CoinTile; a: number; }
interface Rect extends Item { x: number; y: number; w: number; h: number; }

function squarify(items: Item[], x: number, y: number, w: number, h: number): Rect[] {
  if (!items.length) return [];
  return layout(items.map(i => ({ ...i })), x, y, w, h);
}
function layout(items: Item[], x: number, y: number, w: number, h: number): Rect[] {
  if (!items.length) return [];
  if (items.length === 1) return [{ ...items[0], x, y, w, h }];
  const tot = items.reduce((s, i) => s + i.a, 0);
  let best = 1, bR = Infinity;
  for (let n = 1; n <= items.length; n++) {
    const r = worst(items.slice(0, n), w, h, tot);
    if (r < bR) { bR = r; best = n; } else break;
  }
  const row = items.slice(0, best), rest = items.slice(best);
  const rA = row.reduce((s, i) => s + i.a, 0), frac = rA / tot;
  let rects: Rect[], nx: number, ny: number, nw: number, nh: number;
  if (w >= h) {
    const cw = w * frac; rects = place(row, x, y, cw, h, false); nx = x + cw; ny = y; nw = w - cw; nh = h;
  } else {
    const rh = h * frac; rects = place(row, x, y, w, rh, true); nx = x; ny = y + rh; nw = w; nh = h - rh;
  }
  if (!rest.length) return rects;
  const na = nw * nh, rt = rest.reduce((s, i) => s + i.a, 0);
  return [...rects, ...layout(rest.map(i => ({ ...i, a: i.a / rt * na })), nx, ny, nw, nh)];
}
function worst(row: Item[], w: number, h: number, tot: number) {
  const rA = row.reduce((s, i) => s + i.a, 0), side = w >= h ? h : w, rW = rA / tot * (w >= h ? w : h);
  return row.reduce((m, i) => { const iH = (i.a / rA) * side; return Math.max(m, Math.max(rW / iH, iH / rW)); }, 0);
}
function place(row: Item[], x: number, y: number, w: number, h: number, hz: boolean): Rect[] {
  const tot = row.reduce((s, i) => s + i.a, 0); let cx = x, cy = y;
  return row.map(i => {
    const f = i.a / tot;
    const r: Rect = hz ? { ...i, x: cx, y: cy, w: w * f, h } : { ...i, x: cx, y: cy, w, h: h * f };
    hz ? cx += w * f : cy += h * f;
    return r;
  });
}

/* ── 유틸 ──────────────────────────────────────────────── */
type Metric = 'market_cap' | 'current_price' | 'price_change_percentage_24h' | 'total_volume';

const chColor = (v: number) => {
  if (v > 5)   return '#059669'; if (v > 2)   return '#10b981'; if (v > .3)  return '#34d399';
  if (v > -.3) return '#94a3b8'; if (v > -2)  return '#f87171'; if (v > -5)  return '#ef4444';
  return '#b91c1c';
};
const fmtNum = (c: CoinTile, m: Metric): string => {
  if (m === 'market_cap')                  return '$' + (c[m] / 1e9).toFixed(1) + 'B';
  if (m === 'current_price')               return c[m] < 0.01 ? '$' + c[m].toFixed(5) : '$' + c[m].toLocaleString('en', { maximumFractionDigits: 2 });
  if (m === 'price_change_percentage_24h') return (c[m] >= 0 ? '+' : '') + c[m].toFixed(2) + '%';
  if (m === 'total_volume')                return '$' + (c[m] / 1e9).toFixed(2) + 'B';
  return '';
};

const MAP_H = 500;
const METRICS: { key: Metric; label: string }[] = [
  { key: 'market_cap',                  label: '시가총액'   },
  { key: 'current_price',               label: '가격'       },
  { key: 'price_change_percentage_24h', label: '등락률 24h' },
  { key: 'total_volume',                label: '거래량'     },
];

/* ── 메인 컴포넌트 ─────────────────────────────────────── */
export default function Page() {
  const [coins, setCoins]           = useState<CoinTile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [metric, setMetric]         = useState<Metric>('market_cap');
  const [activeCat, setActiveCat]   = useState('all');
  const [showMore, setShowMore]     = useState(false);
  const [status, setStatus]         = useState('로딩 중...');
  const [tooltip, setTooltip]       = useState<{ coin: CoinTile; x: number; y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapW, setMapW] = useState(680);

  // 데이터 로드
  useEffect(() => {
    fetch('/api/coins')
      .then(r => r.json())
      .then(data => {
        setCoins(data.coins ?? []);
        setCategories(data.categories ?? []);
        setStatus(`${data.coins?.length ?? 0}개 코인 · ${new Date(data.updated_at).toLocaleTimeString('ko-KR')} 기준`);
      })
      .catch(() => setStatus('데이터 로드 실패'));
  }, []);

  // 맵 너비 감지
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      setMapW(entries[0].contentRect.width);
    });
    if (mapRef.current) obs.observe(mapRef.current);
    return () => obs.disconnect();
  }, []);

  // 트리맵 계산
  const rects = useCallback((): Rect[] => {
    let data = coins.filter(c => c[metric] != null && Math.abs(c[metric]) > 0);
    if (activeCat !== 'all') data = data.filter(c => c.category_id === activeCat);
    if (!data.length) return [];
    data.sort((a, b) => Math.abs(b[metric]) - Math.abs(a[metric]));
    const tot = data.reduce((s, c) => s + Math.abs(c[metric]), 0);
    const items = data.map(c => ({ coin: c, a: Math.abs(c[metric]) / tot * mapW * MAP_H }));
    return squarify(items, 0, 0, mapW, MAP_H);
  }, [coins, metric, activeCat, mapW]);

  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const visible = showMore ? sorted : sorted.filter(g => g.show_on_start);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl border border-gray-200 p-4">

        {/* 헤더 */}
        <div className="flex items-baseline gap-3 mb-3">
          <h1 className="text-base font-medium text-gray-900">코인 트리맵</h1>
          <span className="text-xs text-gray-400">{status}</span>
        </div>

        {/* 지표 버튼 */}
        <div className="flex gap-2 flex-wrap mb-2">
          {METRICS.map(m => (
            <button key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                metric === m.key
                  ? 'bg-gray-900 text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        {/* 카테고리 버튼 */}
        <div className="flex gap-2 flex-wrap mb-2 items-center">
          <button onClick={() => setActiveCat('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              activeCat === 'all'
                ? 'bg-gray-900 text-white border-transparent'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}>
            전체
          </button>
          {visible.map(g => (
            <button key={g.id} onClick={() => setActiveCat(g.id)}
              style={{ background: g.color, opacity: activeCat === g.id ? 1 : 0.72 }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-all hover:opacity-100 ${
                activeCat === g.id ? 'ring-2 ring-white ring-inset' : ''
              }`}>
              {g.label}
            </button>
          ))}
          {sorted.some(g => !g.show_on_start) && (
            <button onClick={() => setShowMore(p => !p)}
              className="px-3 py-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50">
              {showMore ? '접기 ▲' : '더보기 ▼'}
            </button>
          )}
        </div>

        {/* 범례 */}
        <div className="flex gap-3 flex-wrap mb-2 items-center">
          <span className="text-xs text-gray-400">24h 등락:</span>
          {[
            { color: '#059669', label: '+5%↑' }, { color: '#10b981', label: '+2~5%' },
            { color: '#34d399', label: '0~+2%' }, { color: '#94a3b8', label: '보합' },
            { color: '#f87171', label: '0~-2%' }, { color: '#ef4444', label: '-2~-5%' },
            { color: '#b91c1c', label: '-5%↓' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
              <span className="text-xs text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>

        {/* 트리맵 */}
        <div ref={mapRef} className="relative rounded-lg overflow-hidden border border-gray-100"
          style={{ height: MAP_H }}>
          {rects().map((r, i) => {
            const c = r.coin;
            const ch = c.price_change_percentage_24h || 0;
            const minD = Math.min(r.w, r.h);
            return (
              <div key={c.id}
                style={{
                  position: 'absolute', left: r.x + .5, top: r.y + .5,
                  width: Math.max(r.w - 1, 2), height: Math.max(r.h - 1, 2),
                  background: c.category_color, borderBottom: `3px solid ${chColor(ch)}`,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
                className="flex flex-col items-center justify-center cursor-pointer hover:brightness-110 transition-all"
                onMouseEnter={e => setTooltip({ coin: c, x: e.clientX, y: e.clientY })}
                onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                onMouseLeave={() => setTooltip(null)}>
                {minD > 24 && (
                  <div style={{ fontSize: Math.min(Math.max(minD * .24, 10), 22) }}
                    className="font-medium text-white drop-shadow truncate">
                    {c.symbol.toUpperCase()}
                  </div>
                )}
                {minD > 42 && (
                  <div style={{ fontSize: Math.min(Math.max(minD * .16, 9), 14) }}
                    className="text-white/80 drop-shadow truncate">
                    {fmtNum(c, metric)}
                  </div>
                )}
                {minD > 64 && metric !== 'price_change_percentage_24h' && (
                  <div style={{ fontSize: Math.min(Math.max(minD * .14, 8), 12), color: chColor(ch) + 'dd' }}
                    className="drop-shadow truncate">
                    {(ch >= 0 ? '▲' : '▼') + Math.abs(ch).toFixed(2) + '%'}
                  </div>
                )}
                {minD > 80 && activeCat === 'all' && (
                  <div style={{ fontSize: 9 }} className="text-white/50 drop-shadow truncate mt-0.5">
                    {c.category_label}
                  </div>
                )}
              </div>
            );
          })}
          {coins.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              데이터 로딩 중...
            </div>
          )}
        </div>

        {/* 툴팁 */}
        {tooltip && (
          <div className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs pointer-events-none"
            style={{ left: tooltip.x + 14, top: tooltip.y - 10, minWidth: 188 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900">{tooltip.coin.name}</span>
              <span className="text-gray-400">{tooltip.coin.symbol.toUpperCase()}</span>
              <span className="ml-auto text-white text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: tooltip.coin.category_color }}>
                {tooltip.coin.category_label}
              </span>
            </div>
            {[
              { label: '가격',      val: fmtNum(tooltip.coin, 'current_price') },
              { label: '시가총액',   val: fmtNum(tooltip.coin, 'market_cap') },
              { label: '거래량 24h', val: fmtNum(tooltip.coin, 'total_volume') },
            ].map(row => (
              <div key={row.label} className="flex justify-between gap-4 text-gray-500 my-1">
                <span>{row.label}</span>
                <span className="font-medium text-gray-900">{row.val}</span>
              </div>
            ))}
            <div className="flex justify-between gap-4 text-gray-500 my-1">
              <span>24h 등락</span>
              <span className="font-medium" style={{ color: chColor(tooltip.coin.price_change_percentage_24h || 0) }}>
                {fmtNum(tooltip.coin, 'price_change_percentage_24h')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
