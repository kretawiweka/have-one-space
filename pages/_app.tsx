import '@/css/tailwind.css'
import '@/css/prism.css'
import 'katex/dist/katex.css'

import { ThemeProvider } from 'next-themes'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/router'

import siteMetadata from '@/data/siteMetadata'
import Analytics from '@/components/analytics'
import { SearchProvider } from 'pliny/search'
import LayoutWrapper from '@/components/LayoutWrapper'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter()
  const isAdminRoute = router.pathname.startsWith('/admin')

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme}>
        <Head>
          <meta content="width=device-width, initial-scale=1" name="viewport" />
        </Head>
        <Analytics />
        {isAdminRoute ? (
          <Component {...pageProps} />
        ) : (
          <LayoutWrapper>
            <SearchProvider searchConfig={siteMetadata.search}>
              <Component {...pageProps} />
            </SearchProvider>
          </LayoutWrapper>
        )}
      </ThemeProvider>
    </SessionProvider>
  )
}
