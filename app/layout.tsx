import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/lib/notification-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SkillsVault - Trade Skills, Not Money",
  description:
    "Connect with your community through skill sharing. Exchange time credits and build meaningful relationships.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen">
        <NotificationProvider>
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster />
        </NotificationProvider>
      </body>
    </html>
  )
}
