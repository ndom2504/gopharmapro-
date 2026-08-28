import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import { site } from '@/lib/site';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Pharmacie en ligne au Gabon`,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
  icons: {
    icon: '/brand/mark.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: site.name,
    description: site.tagline,
    url: site.url,
    locale: 'fr_GA',
    type: 'website',
    images: [{ url: '/og.png', width: 1022, height: 309, alt: 'Gopharmapro' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
