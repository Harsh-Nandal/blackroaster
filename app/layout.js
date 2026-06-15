import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import ScrollTop from '@/components/ui/ScrollTop'
import '@/styles/globals.css'

export const metadata = {
  title: {
    default: 'BlackRoaster — Premium PVC Wall Panels',
    template: '%s | BlackRoaster',
  },
  description:
    'Premium PVC wall panels for modern Indian interiors. 3D wall panels, ceiling panels, fluted panels, stone finish and wood finish — delivered pan India with custom sizing.',
  keywords: [
    'PVC wall panels',
    'wall panels India',
    '3D wall panels',
    'ceiling panels',
    'fluted panels',
    'BlackRoaster panels',
  ],
  openGraph: {
    title: 'BlackRoaster — Premium PVC Wall Panels',
    description: 'Elevate Every Wall, Every Room',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CustomCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ScrollTop />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                borderRadius: '0px',
                background: '#111111',
                color: '#fff',
              },
              success: { iconTheme: { primary: '#C9A86A', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
