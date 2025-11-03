// app/layout.tsx

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppProviders } from "./AppProviders";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

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
            <NextSSRPlugin
              routerConfig={extractRouterConfig(ourFileRouter)}
            />
            {children}
          </Providers>
        </AppProviders>
      </body>
    </html>
  );
}
