import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#FFD700',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Sparkie ⚡ - Queen Bee Chatbot',
  description: 'Chat with Sparkie, the elegant Queen Bee of Polleneer. Smart, helpful, and always buzzing with ideas.',
  keywords: ['AI chatbot', 'Queen Bee', 'Polleneer', 'artificial intelligence', 'chatbot', 'Sparkie AI'],
  authors: [{ name: 'Angel Michael', url: 'https://github.com/Draguniteus' }],
  creator: 'Angel Michael (@WeGotHeaven)',
  publisher: 'Polleneer',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sparkie-ai.ondigitalocean.app/',
    siteName: 'Sparkie AI',
    title: 'Sparkie ⚡ - Queen Bee Chatbot',
    description: 'Chat with Sparkie, the elegant Queen Bee of Polleneer. Smart, helpful, and always buzzing with ideas.',
    images: [
      {
        url: '/sparkie-avatar.png',
        width: 512,
        height: 512,
        alt: 'Sparkie - Queen Bee of Polleneer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sparkie ⚡ - Queen Bee Chatbot',
    description: 'Chat with Sparkie, the elegant Queen Bee of Polleneer',
    images: ['/sparkie-avatar.png'],
    creator: '@WeGotHeaven',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
