"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"

interface Transaction {
  id: string
  from_user_id: string
  to_user_id: string
  hours_exchanged: number
  created_at: string
  from_user: {
    full_name: string
    avatar_url: string | null
  }
  to_user: {
    full_name: string
    avatar_url: string | null
  }
}

export default function RatePage() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.transactionId as string

  const supabase = createClient()

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setCurrentUser(user)

        // Fetch transaction
        const res = await fetch(`/api/transactions/${transactionId}`)
        if (!res.ok) throw new Error("Failed to fetch transaction")
        const data = await res.json()
        setTransaction(data)
      } catch (err) {
        console.error("[v0] Error:", err)
        setError("Failed to load transaction")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [transactionId, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      if (!transaction) throw new Error("Transaction not found")

      // Determine who is being rated
      const ratedUserId =
        transaction.from_user_id === currentUser.id ? transaction.to_user_id : transaction.from_user_id

      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: transactionId,
          rated_user_id: ratedUserId,
          rating,
          review: review || null,
        }),
      })

      if (!res.ok) throw new Error("Failed to submit rating")

      router.push("/history")
    } catch (err) {
      console.error("[v0] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to submit rating")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error || "Transaction not found"}</p>
            <Button onClick={() => router.push("/history")} className="mt-4">
              Back to History
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const ratedUser = transaction.from_user_id === currentUser?.id ? transaction.to_user : transaction.from_user

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Rate Your Experience</h1>
          <p className="mt-2 text-muted-foreground">Help the community by sharing your feedback</p>
        </div>

        <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
                {ratedUser.avatar_url ? (
                  <img
                    src={ratedUser.avatar_url || "/placeholder.svg"}
                    alt={ratedUser.full_name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-8 w-8 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{ratedUser.full_name}</CardTitle>
                <CardDescription>
                  Exchange of {transaction.hours_exchanged} hours on{" "}
                  {new Date(transaction.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-foreground">How would you rate this exchange?</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-all duration-300 hover:scale-110"
                    >
                      <svg
                        className={`h-12 w-12 transition-all duration-300 ${
                          star <= rating
                            ? "fill-accent text-accent drop-shadow-lg"
                            : "fill-muted text-muted hover:fill-accent/50"
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {rating === 5 && "Excellent! This was a great experience."}
                  {rating === 4 && "Good! This was a positive exchange."}
                  {rating === 3 && "Average. It was okay."}
                  {rating === 2 && "Below average. There were some issues."}
                  {rating === 1 && "Poor. This was not a good experience."}
                </p>
              </div>

              {/* Review */}
              <div className="space-y-2">
                <label htmlFor="review" className="text-lg font-semibold text-foreground">
                  Write a review (optional)
                </label>
                <Textarea
                  id="review"
                  placeholder="Share your experience with this exchange..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  disabled={submitting}
                  rows={4}
                  className="rounded-xl border-border/50 bg-background/50"
                />
                <p className="text-xs text-muted-foreground">{review.length}/500 characters</p>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive ring-1 ring-destructive/20">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/history")}
                  disabled={submitting}
                  className="flex-1 rounded-xl"
                >
                  Skip
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Rating"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
