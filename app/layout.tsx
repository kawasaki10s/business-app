import type { Metadata } from 'next';
import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap', style: ['italic', 'normal'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Biznes Boshqaruv Platformasi',
  description: 'Investorlar va admin uchun biznesni raqamlashtirish platformasi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className={`${inter.variable} ${newsreader.variable} ${mono.variable} font-sans bg-background text-ink antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
