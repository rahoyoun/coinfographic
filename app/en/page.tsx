import type { Metadata } from 'next';
import Page from '../page';   // 트리맵 UI 재사용

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

export const metadata: Metadata = {
  title: 'Crypto Treemap | Real-time Cryptocurrency Market Map',
  description: 'Real-time crypto treemap visualizing market cap, price, and 24h change. Track 80+ coins including Bitcoin and Ethereum by category.',
  keywords: 'crypto treemap, cryptocurrency market cap, bitcoin, ethereum, DeFi, altcoin, real-time crypto, coin market visualization',
  alternates: {
    canonical: '/en',
    languages: { 'ko': '/', 'en': '/en', 'ja': '/ja', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/en`,
    siteName: 'Crypto Treemap',
    title: 'Crypto Treemap | Real-time Cryptocurrency Market Map',
    description: 'Real-time crypto treemap visualizing market cap, price, and 24h change. Track 80+ coins by category.',
    locale: 'en_US',
    alternateLocale: ['ko_KR', 'ja_JP'],
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Crypto Treemap - Real-time Cryptocurrency Market Map' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Treemap | Real-time Cryptocurrency Market Map',
    description: 'Real-time crypto treemap visualizing market cap, price, and 24h change.',
    images: ['/og-image.png'],
  },
};

// UI는 한국어 페이지 재사용 (나중에 i18n 붙이면 분리)
export default Page;
