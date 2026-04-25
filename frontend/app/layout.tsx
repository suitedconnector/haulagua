import type { Metadata } from 'next'
import { Montserrat, Lato } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800']
});
const lato = Lato({ 
  subsets: ["latin"],
  variable: '--font-lato',
  weight: ['300', '400', '700']
});

export const metadata: Metadata = {
  title: 'Haulagua - Fast, Reliable Bulk Water Delivery',
  description: 'Find trusted professional water haulers for your pool, construction site, or emergency needs. Verified pros, detailed profiles, all services.',
  generator: 'v0.app',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
      </head>
      <body className={`${montserrat.variable} ${lato.variable} font-sans antialiased`} style={{ background: "linear-gradient(to bottom, #005A9C 100px, white 100px)" }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
