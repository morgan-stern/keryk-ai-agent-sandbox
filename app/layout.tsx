import type { Metadata, Viewport } from 'next'
import { Exo_2, Alegreya_Sans } from 'next/font/google'
import './globals.css'

const exo2 = Exo_2({ 
  subsets: ['latin'],
  variable: '--font-exo2',
  display: 'swap',
})

const alegreyaSans = Alegreya_Sans({ 
  subsets: ['latin'],
  variable: '--font-alegreya-sans',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Keryk AI Agent Sandbox',
  description: 'Demo platform for single agent interactions via text or voice',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${exo2.variable} ${alegreyaSans.variable} font-body bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  )
}