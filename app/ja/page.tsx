import type { Metadata } from 'next';
import Page from '../page';   // 트리맵 UI 재사용

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

export const metadata: Metadata = {
  title: 'コイン ツリーマップ | リアルタイム暗号資産マーケットマップ',
  description: 'リアルタイム暗号資産のツリーマップ。時価総額・価格・騰落率をカテゴリ別に可視化。ビットコイン・イーサリアムなど80銘柄以上対応。',
  keywords: '暗号資産 ツリーマップ, 仮想通貨 時価総額, ビットコイン, イーサリアム, DeFi, アルトコイン, リアルタイム 暗号資産',
  alternates: {
    canonical: '/ja',
    languages: { 'ko': '/', 'en': '/en', 'ja': '/ja', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/ja`,
    siteName: 'コイン ツリーマップ',
    title: 'コイン ツリーマップ | リアルタイム暗号資産マーケットマップ',
    description: 'リアルタイム暗号資産のツリーマップ。時価総額・価格・騰落率をカテゴリ別に可視化。',
    locale: 'ja_JP',
    alternateLocale: ['ko_KR', 'en_US'],
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'コイン ツリーマップ - リアルタイム暗号資産マーケットマップ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コイン ツリーマップ | リアルタイム暗号資産マーケットマップ',
    description: 'リアルタイム暗号資産のツリーマップ。時価総額・価格・騰落率をカテゴリ別に可視化。',
    images: ['/og-image.png'],
  },
};

export default Page;
