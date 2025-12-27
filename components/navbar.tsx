"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const fetchUserProfile = async () => {
    try {
      const profileRes = await fetch("/api/profile")
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setUser(profileData)
      }
    } catch (err) {
      console.error("[v0] Error fetching profile:", err)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setAuthenticated(true)
          await fetchUserProfile()
        }
      } catch (err) {
        console.error("[v0] Error:", err)
      }
    }

    checkAuth()

    const interval = setInterval(() => {
      if (authenticated) {
        fetchUserProfile()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [supabase, authenticated])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setAuthenticated(false)
      setUser(null)
      setMobileMenuOpen(false)
      router.push("/")
    } catch (err) {
      console.error("[v0] Error:", err)
    }
  }

  return (
    <nav className="animate-slide-down sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              href={authenticated ? "/dashboard" : "/"}
              className="flex items-center gap-3 transition-transform hover:scale-102"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30 ring-2 ring-primary/20 sm:h-11 sm:w-11">
                <svg
                  className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="hidden text-lg font-bold tracking-tight text-foreground sm:inline-block sm:text-xl">
                SkillsVault
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {authenticated && (
            <div className="hidden items-center gap-6 md:flex lg:gap-8">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-all hover:scale-102 hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/marketplace"
                className="text-sm font-medium text-muted-foreground transition-all hover:scale-102 hover:text-foreground"
              >
                Marketplace
              </Link>
              <Link
                href="/requests"
                className="text-sm font-medium text-muted-foreground transition-all hover:scale-102 hover:text-foreground"
              >
                Requests
              </Link>
              <Link
                href="/messages"
                className="text-sm font-medium text-muted-foreground transition-all hover:scale-102 hover:text-foreground"
              >
                Messages
              </Link>
              <Link
                href="/history"
                className="text-sm font-medium text-muted-foreground transition-all hover:scale-102 hover:text-foreground"
              >
                History
              </Link>
              <Link
                href="/my-videos"
                className="text-sm font-medium text-muted-foreground transition-all hover:scale-102 hover:text-foreground"
              >
                My Videos
              </Link>
              {user?.is_admin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-destructive transition-all hover:scale-102 hover:text-destructive/80"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {authenticated ? (
              <>
                {/* Time Balance - Hidden on mobile */}
                <div className="hidden items-center gap-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 px-3 py-1.5 shadow-lg shadow-accent/10 ring-1 ring-accent/20 transition-all hover:scale-102 hover:shadow-accent/20 sm:flex">
                  <svg
                    className="h-4 w-4 text-accent sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-bold text-foreground sm:text-base">{user?.time_balance || 0} hrs</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden md:flex">
                    <button className="flex items-center gap-2 rounded-lg transition-all hover:scale-102">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.full_name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                          {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.full_name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user?.id}`} className="cursor-pointer">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit" className="cursor-pointer">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground transition-all hover:scale-102 hover:bg-muted/80 md:hidden"
                  title="Menu"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-xs transition-all hover:scale-102 active:scale-95 sm:size-default sm:rounded-xl sm:text-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="rounded-lg text-xs shadow-lg shadow-primary/30 transition-all hover:scale-102 hover:shadow-primary/40 active:scale-95 sm:size-default sm:rounded-xl sm:text-sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {authenticated && mobileMenuOpen && (
          <div className="animate-fade-in-up border-t border-border/50 bg-card/95 backdrop-blur-sm md:hidden">
            <div className="space-y-1 px-4 py-4">
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 px-4 py-2 shadow-lg shadow-accent/10 ring-1 ring-accent/20">
                <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-base font-bold text-foreground">{user?.time_balance || 0} hrs</span>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                Marketplace
              </Link>
              <Link
                href="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                Requests
              </Link>
              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                Messages
              </Link>
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                History
              </Link>
              <Link
                href={`/profile/${user?.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                View Profile
              </Link>
              <Link
                href="/profile/edit"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                Edit Profile
              </Link>
              <Link
                href="/my-videos"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                My Videos
              </Link>
              {user?.is_admin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-muted hover:text-destructive/80"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
