import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { getSkillsForMarketplace } from "@/lib/supabase/server-queries"
import { MarketplaceFilters } from "@/components/marketplace-filters"

const CATEGORIES = ["Technology", "Business", "Creative", "Health", "Education", "Lifestyle", "Other"]

interface Skill {
  id: string
  title: string
  description: string
  category: string
  user_id: string
  profiles: {
    full_name: string
    avatar_url: string | null
  }
  rating?: number
}

export default async function MarketplacePage() {
  const skills: Skill[] = await getSkillsForMarketplace()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Skill Marketplace</h1>
          <p className="mt-2 text-lg text-muted-foreground">Discover and exchange skills with the community</p>
        </div>

        <MarketplaceFilters initialSkills={skills} categories={CATEGORIES} />

        {/* Skills Grid */}
        {skills.length === 0 ? (
          <Card className="border-border/50 bg-card shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <svg
                className="mb-4 h-12 w-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mb-2 text-xl font-semibold text-foreground">No skills found</h3>
              <p className="text-center text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <Card
                key={skill.id}
                className="border-border/50 bg-card shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="mb-3 flex items-start justify-between">
                    <CardTitle className="text-xl font-semibold text-card-foreground">{skill.title}</CardTitle>
                    <Badge variant="secondary" className="rounded-lg bg-primary/10 text-primary">
                      {skill.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 text-muted-foreground">{skill.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                      {skill.profiles?.avatar_url ? (
                        <img
                          src={skill.profiles.avatar_url || "/placeholder.svg"}
                          alt={skill.profiles.full_name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-5 w-5 text-primary-foreground"
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
                      <p className="font-medium text-foreground">{skill.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">Skill provider</p>
                    </div>
                  </div>

                  <Button className="w-full rounded-lg shadow-md shadow-primary/20" asChild>
                    <a href={`/skills/${skill.id}`}>View Details</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
