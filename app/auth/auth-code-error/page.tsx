import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive">
              <svg
                className="h-6 w-6 text-destructive-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <CardTitle className="text-center text-2xl font-bold text-card-foreground">
              Email Confirmation Failed
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              There was an issue confirming your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The confirmation link may have expired. Please try signing up again or contact support if you continue to
              experience issues.
            </p>

            <div className="flex flex-col gap-2">
              <Link href="/signup">
                <Button className="w-full">Try Signing Up Again</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
