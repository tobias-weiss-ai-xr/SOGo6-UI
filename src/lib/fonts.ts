import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import localFont from 'next/font/local'

export const geistSans = GeistSans
export const geistMono = GeistMono

// Classic theme parity: SOGo5 ships "Fira Sans"; sogo6's default UI font is
// Geist. The classic theme (see globals.css .sogo5-classic) rebinds the font
// vars to Fira so the classic skin renders type-identical to SOGo5.
export const firaSans = localFont({
  src: [
    {
      path: '../assets/fonts/FiraSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/FiraSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/FiraSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-fira-sans',
  display: 'swap',
})

export const openDyslexic = localFont({
  src: [
    {
      path: '../assets/fonts/OpenDyslexic-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/OpenDyslexic-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/OpenDyslexic-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/OpenDyslexic-Bold-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-opendyslexic',
  display: 'swap',
  fallback: ['var(--font-geist-sans)', 'sans-serif'],
})
