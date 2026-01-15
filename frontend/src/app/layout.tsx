import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sparkie - Queen Bee of Polleneer',
  description: 'Chat with Sparkie, the elegant Queen Bee chatbot for Polleneer social network',
  keywords: ['chatbot', 'AI', 'bee', 'Polleneer', 'Sparkie'],
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
