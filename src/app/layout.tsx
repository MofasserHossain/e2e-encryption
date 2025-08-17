import { ThemeProvider } from '@/components/theme/theme-provider'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import React from 'react'
import '../styles/tailwind.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Next.js Boilerplate - Complete Dev Workflow',
  description:
    'A modern, production-ready Next.js 15 boilerplate with Husky, Commitlint, ESLint, Prettier, shadcn/ui, and TypeScript. Start building professional apps instantly.',
  keywords: [
    'nextjs',
    'next.js',
    'boilerplate',
    'template',
    'husky',
    'commitlint',
    'eslint',
    'prettier',
    'shadcn',
    'typescript',
    'tailwindcss',
    'react',
    'workflow',
    'git-hooks',
    'conventional-commits',
  ],
  authors: [
    {
      name: 'Mofasser Hossain',
      url: 'https://github.com/MofasserHossain',
    },
  ],
  creator: 'Mofasser Hossain',
  publisher: 'Mofasser Hossain',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://github.com/MofasserHossain/next-husky-commitlint-eslint-prettier-boilerplate',
    title: 'Next.js Boilerplate - Complete Dev Workflow',
    description:
      'A modern, production-ready Next.js 15 boilerplate with complete development workflow setup.',
    siteName: 'Next.js Boilerplate Template',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Next.js Boilerplate Template',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next.js Boilerplate - Complete Dev Workflow',
    description:
      'A modern, production-ready Next.js 15 boilerplate with complete development workflow setup.',
    creator: '@MofasserHossain',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
