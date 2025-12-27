"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"

interface Transaction {
  id: string
  skill_id: string
  skill_title: string
  from_user_id: string
  from_user_name: string
  to_user_id: string
  to_user_name: string
  hours: number
  created_at: string
}

interface User {
  id: string
  name: string
  time_balance: number
}

export default function HistoryPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push("/login")
          return
        }

        const profileRes = await fetch("/api/profile")
        if (!profileRes.ok) throw new Error("Failed to fetch profile")
        const profileData = await profileRes.json()
        setUser(profileData)

        const transactionsRes = await fetch("/api/transactions")
        if (!transactionsRes.ok) throw new Error("Failed to fetch transactions")
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      } catch (err) {
        console.error("[v0] Error:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  const userTransactions = transactions.filter((t) => t.from_user_id === user?.id || t.to_user_id === user?.id)

  const totalEarned = userTransactions.filter((t) => t.to_user_id === user?.id).reduce((sum, t) => sum + t.hours, 0)

  const totalSpent = userTransactions.filter((t) => t.from_user_id === user?.id).reduce((sum, t) => sum + t.hours, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-slide-in-left mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground">View all your time credit exchanges</p>
        </div>

        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <Card className="animate-fade-in-up animate-delay-100 border-border bg-card transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Current Balance</CardDescription>
              <CardTitle className="text-3xl font-bold text-card-foreground">{user?.time_balance || 0} hrs</CardTitle>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in-up animate-delay-200 border-border bg-card transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Total Earned</CardDescription>
              <CardTitle className="text-3xl font-bold text-primary">+{totalEarned} hrs</CardTitle>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in-up animate-delay-300 border-border bg-card transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Total Spent</CardDescription>
              <CardTitle className="text-3xl font-bold text-accent">-{totalSpent} hrs</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="animate-scale-in border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">All Transactions</CardTitle>
            <CardDescription className="text-muted-foreground">Complete history of your time exchanges</CardDescription>
          </CardHeader>
          <CardContent>
            {userTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">No transactions yet</h3>
                <p className="text-center text-muted-foreground">
                  Start exchanging skills to see your transaction history
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userTransactions.map((transaction, index) => {
                  const isEarned = transaction.to_user_id === user?.id
                  return (
                    <div
                      key={transaction.id}
                      className="animate-fade-in-up flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-all duration-300 hover:scale-[1.02] hover:bg-muted/50 hover:shadow-lg hover:-translate-y-1"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110 hover:rotate-12 ${
                            isEarned ? "bg-primary/10" : "bg-accent/10"
                          }`}
                        >
                          {isEarned ? (
                            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          ) : (
                            <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                        </div>

                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{transaction.skill_title}</h3>
                            <Badge
                              variant="secondary"
                              className={`transition-all duration-300 hover:scale-110 ${isEarned ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}
                            >
                              {isEarned ? "Earned" : "Spent"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {isEarned ? (
                              <>
                                From <span className="font-medium text-foreground">{transaction.from_user_name}</span>
                              </>
                            ) : (
                              <>
                                To <span className="font-medium text-foreground">{transaction.to_user_name}</span>
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                            {new Date(transaction.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold transition-all duration-300 hover:scale-110 ${isEarned ? "text-primary" : "text-accent"}`}
                        >
                          {isEarned ? "+" : "-"}
                          {transaction.hours} hrs
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
