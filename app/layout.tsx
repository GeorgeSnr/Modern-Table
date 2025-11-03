// app/layout.tsx

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppProviders } from "./AppProviders";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
  <body
    className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 dark:bg-[#424d5e]`}
  >

        <AppProviders>
          <Providers>
            
            {children}
          </Providers>
        </AppProviders>
      </body>
    </html>
  );
}
