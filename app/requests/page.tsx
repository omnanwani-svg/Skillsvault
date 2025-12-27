"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"
import { useNotifications } from "@/hooks/use-notifications"

interface Request {
  id: string
  skill_id: string
  skill_title: string
  from_user_id: string
  from_user_name: string
  to_user_id: string
  to_user_name: string
  hours: number
  status: "pending" | "accepted" | "rejected"
  created_at: string
}

interface User {
  id: string
  name: string
}

export default function RequestsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { notifySuccess, notifyError } = useNotifications()

  const [user, setUser] = useState<User | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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

        const requestsRes = await fetch("/api/requests")
        if (!requestsRes.ok) throw new Error("Failed to fetch requests")
        const requestsData = await requestsRes.json()
        setRequests(requestsData)
      } catch (err) {
        console.error("[v0] Error:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleAccept = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      })

      if (!res.ok) throw new Error("Failed to accept request")

      setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r)))
      notifySuccess("Request accepted! Time credits have been added to your balance.")
    } catch (err) {
      console.error("[v0] Error:", err)
      notifyError("Failed to accept request. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (!res.ok) throw new Error("Failed to reject request")

      setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: "rejected" } : r)))
      notifySuccess("Request rejected.")
    } catch (err) {
      console.error("[v0] Error:", err)
      notifyError("Failed to reject request. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const receivedRequests = requests.filter((r) => r.to_user_id === user?.id)
  const sentRequests = requests.filter((r) => r.from_user_id === user?.id)

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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
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

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-slide-in-left mb-8">
          <h1 className="mb-2 text-4xl font-semibold tracking-tight text-foreground">Requests</h1>
          <p className="text-lg text-muted-foreground">Manage incoming and outgoing skill exchange requests</p>
        </div>

        <Tabs defaultValue="received" className="animate-fade-in-up w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl p-1 shadow-lg">
            <TabsTrigger
              value="received"
              className="rounded-lg transition-all duration-300 data-[state=active]:scale-105"
            >
              Received
              {receivedRequests.filter((r) => r.status === "pending").length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 min-w-5 animate-pulse rounded-full bg-accent px-1.5 text-xs text-accent-foreground"
                >
                  {receivedRequests.filter((r) => r.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="rounded-lg transition-all duration-300 data-[state=active]:scale-105">
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-8">
            {receivedRequests.length === 0 ? (
              <Card className="animate-scale-in rounded-2xl border-border bg-card shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                    <svg
                      className="h-10 w-10 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">No requests received</h3>
                  <p className="text-center text-muted-foreground">
                    When someone requests your skills, they'll appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-5">
                {receivedRequests.map((request, index) => (
                  <Card
                    key={request.id}
                    className="animate-fade-in-up rounded-2xl border-border bg-card shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-3">
                            <CardTitle className="text-2xl font-semibold tracking-tight text-card-foreground">
                              {request.skill_title}
                            </CardTitle>
                            <Badge
                              variant="secondary"
                              className={
                                request.status === "pending"
                                  ? "rounded-lg bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                                  : request.status === "accepted"
                                    ? "rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                    : "rounded-lg bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-base text-muted-foreground">
                            Request from <span className="font-medium text-foreground">{request.from_user_name}</span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2">
                          <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-lg font-semibold text-accent">{request.hours} hrs</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Requested on {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      {request.status === "pending" && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleAccept(request.id)}
                            disabled={actionLoading === request.id}
                            className="flex-1 rounded-xl shadow-md shadow-primary/20"
                            size="lg"
                          >
                            {actionLoading === request.id ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Accept
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            disabled={actionLoading === request.id}
                            variant="outline"
                            className="flex-1 rounded-xl"
                            size="lg"
                          >
                            {actionLoading === request.id ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-8">
            {sentRequests.length === 0 ? (
              <Card className="animate-scale-in rounded-2xl border-border bg-card shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                    <svg
                      className="h-10 w-10 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">No requests sent</h3>
                  <p className="text-center text-muted-foreground">
                    Browse the marketplace and request help from community members
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-5">
                {sentRequests.map((request, index) => (
                  <Card
                    key={request.id}
                    className="animate-fade-in-up rounded-2xl border-border bg-card shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-3">
                            <CardTitle className="text-2xl font-semibold tracking-tight text-card-foreground">
                              {request.skill_title}
                            </CardTitle>
                            <Badge
                              variant="secondary"
                              className={
                                request.status === "pending"
                                  ? "rounded-lg bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                                  : request.status === "accepted"
                                    ? "rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                    : "rounded-lg bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-base text-muted-foreground">
                            Request to <span className="font-medium text-foreground">{request.to_user_name}</span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2">
                          <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-lg font-semibold text-accent">{request.hours} hrs</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Sent on {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
