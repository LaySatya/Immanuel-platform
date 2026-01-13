// app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Music Platform',
  description: 'Upload and manage your music collection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
