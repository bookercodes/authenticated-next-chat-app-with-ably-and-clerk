import { Inter } from "next/font/google";
import { ClerkLoaded, ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Comet"
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>

          <nav className="flex justify-between p-5 border-b border-gray-200">
            <h1 className="font-bold">Comet</h1>
            <SignedOut>
              <SignInButton mode='modal' />
            </SignedOut>
            <SignedIn>
              <UserButton showName afterSignOutUrl="/" />
            </SignedIn>
          </nav>

          <ClerkLoaded>
            {children}
          </ClerkLoaded>

        </body>
      </html>
    </ClerkProvider >
  )
}