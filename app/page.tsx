import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="animate-fade-in relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center">
            <div className="animate-bounce-subtle mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 shadow-lg shadow-primary/10">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="text-sm font-medium text-muted-foreground">Join our growing community</span>
            </div>

            <h1 className="animate-fade-in-up animate-delay-100 mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Trade Skills, Not Money
            </h1>

            <p className="animate-fade-in-up animate-delay-200 mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Connect with your community through skill sharing. Every hour you give is an hour you can receive. Build
              relationships, learn new skills, and create a more collaborative world.
            </p>

            <div className="animate-scale-in animate-delay-300 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-102 hover:shadow-primary/50 active:scale-95"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent transition-all duration-300 hover:scale-102 active:scale-95"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="animate-fade-in-up mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              How SkillsVault Works
            </h2>
            <p className="animate-fade-in-up animate-delay-100 mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
              A simple, fair system where everyone's time is valued equally
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="animate-fade-in-up animate-delay-100 border-border bg-card transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-card-foreground">1. Offer Your Skills</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Share what you're good at - from web design to gardening, cooking to tutoring. Every skill has value.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up animate-delay-200 border-border bg-card transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-card-foreground">2. Exchange Time</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Help someone for an hour, earn an hour. Use your time credits to get help from others in the
                  community.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up animate-delay-300 border-border bg-card transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-card-foreground">3. Build Community</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Create meaningful connections, learn from neighbors, and strengthen your local community bonds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="animate-fade-in-up mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              Why Join SkillsVault?
            </h2>
            <p className="animate-fade-in-up animate-delay-100 mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
              Discover the benefits of skill sharing and community collaboration
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="animate-fade-in-up animate-delay-100 border-border bg-card transition-all duration-300 hover:scale-102 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">Equal Value</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Everyone's time is worth the same. No matter your profession, one hour equals one credit.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up animate-delay-200 border-border bg-card transition-all duration-300 hover:scale-102 hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">Learn Skills</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Access expertise you couldn't afford otherwise. Expand your abilities affordably.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up animate-delay-300 border-border bg-card transition-all duration-300 hover:scale-102 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.656"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">Build Network</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Meet neighbors, make friends, and create a support network that goes beyond transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up animate-delay-400 border-border bg-card transition-all duration-300 hover:scale-102 hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">No Money Needed</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Participate fully regardless of financial situation. Your time is your currency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">Get Started Today</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <svg
                      className="h-5 w-5 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Create Your Profile</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      Sign up in minutes and start offering your skills to the community.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <svg
                      className="h-5 w-5 text-accent-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Receive 10 Hours</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      Every new member gets 10 time credits to start exchanging immediately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <svg
                      className="h-5 w-5 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Start Trading</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      Browse skills, make requests, and begin your journey of community collaboration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md border-border bg-card p-8 shadow-xl">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-card-foreground">Start with 10 Hours</h3>
                  <p className="text-muted-foreground">Every new member receives 10 time credits to get started</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                    <span className="font-medium text-secondary-foreground">Initial Balance</span>
                    <span className="text-xl font-bold text-accent">10 hrs</span>
                  </div>
                  <Link href="/signup" className="block">
                    <Button className="w-full" size="lg">
                      Join Now
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-secondary/10 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">Ready to Start Trading Skills?</h2>
          <p className="mb-10 text-pretty text-lg text-muted-foreground">
            Join thousands of community members who are building a more collaborative economy
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-8">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 SkillsVault. Building stronger communities through skill exchange.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
