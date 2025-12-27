"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const msg = searchParams.get("message")
    if (msg) {
      setMessage(msg)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      let supabase
      try {
        supabase = createClient()
      } catch (clientError) {
        console.error("[v0] Failed to create Supabase client:", clientError)
        setError("Failed to connect to authentication service. Please check your internet connection and try again.")
        setLoading(false)
        return
      }

      console.log("[v0] Attempting login for:", email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("[v0] Auth error:", authError)
        if (authError.message.includes("Email not confirmed")) {
          setError("Please confirm your email before signing in. Check your inbox for a confirmation link.")
        } else if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.")
        } else {
          setError(authError.message)
        }
        throw authError
      }

      if (!data.user) {
        setError("Login failed. Please try again.")
        return
      }

      if (!data.user.email_confirmed_at) {
        setError("Please confirm your email before signing in. Check your inbox for a confirmation link.")
        return
      }

      console.log("[v0] Login successful, redirecting to dashboard")

      // Wait a brief moment for the session to be stored
      await new Promise((resolve) => setTimeout(resolve, 100))
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("[v0] Login error:", err)
      // Error is already set above
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <CardTitle className="text-center text-2xl font-bold text-card-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to your SkillsVault account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background"
                  disabled={loading}
                />
              </div>

              {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              {message && <div className="rounded-lg bg-blue-500/10 p-3 text-sm text-blue-600">{message}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
