import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

const META = {
  title: {
    default: '코인 트리맵 | 실시간 암호화폐 시장 지도',
    template: '%s | 코인 트리맵',
  },
  description: {
    ko: '실시간 암호화폐 시가총액, 가격, 등락률을 한눈에 보는 트리맵. 비트코인, 이더리움 등 80개 코인을 카테고리별로 시각화.',
    en: 'Real-time crypto treemap visualizing market cap, price, and 24h change. Track 80+ coins including Bitcoin and Ethereum by category.',
    ja: 'リアルタイム暗号資産のツリーマップ。時価総額・価格・騰落率をカテゴリ別に可視化。ビットコイン・イーサリアムなど80銘柄対応。',
  },
  keywords: 'crypto treemap, 암호화폐 시가총액, bitcoin, ethereum, 비트코인, 이더리움, DeFi, 코인 시장, cryptocurrency market cap, 暗号資産, ビットコイン',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: META.title,
  description: META.description.ko,
  keywords: META.keywords,
  authors: [{ name: 'Raho Studio', url: BASE_URL }],
  creator: 'Raho Studio',
  publisher: 'Raho Studio',

  alternates: {
    canonical: '/',
    languages: {
      'ko': '/',
      'en': '/en',
      'ja': '/ja',
      'x-default': '/',
    },
  },

  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: '코인 트리맵',
    title: '코인 트리맵 | 실시간 암호화폐 시장 지도',
    description: META.description.ko,
    locale: 'ko_KR',
    alternateLocale: ['en_US', 'ja_JP'],
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '코인 트리맵 - 실시간 암호화폐 시장 지도',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: '코인 트리맵 | 실시간 암호화폐 시장 지도',
    description: META.description.ko,
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  category: 'finance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '코인 트리맵',
              url: BASE_URL,
              description: META.description.ko,
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              inLanguage: ['ko', 'en', 'ja'],
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              author: { '@type': 'Organization', name: 'Raho Studio', url: BASE_URL },
            }),
          }}
        />
        {/* 네이버 웹마스터 도구 */}
        {/* <meta name="naver-site-verification" content="YOUR_NAVER_CODE" /> */}
        {/* Google Search Console */}
        {/* <meta name="google-site-verification" content="YOUR_GOOGLE_CODE" /> */}
      </head>
      <body>{children}</body>
    </html>
  );
}
