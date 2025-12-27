"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

interface MarketplaceFiltersProps {
  initialSkills: Skill[]
  categories: string[]
}

export function MarketplaceFilters({ initialSkills, categories }: MarketplaceFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest")

  const filteredSkills = useMemo(() => {
    let filtered = initialSkills

    if (searchQuery) {
      filtered = filtered.filter(
        (skill) =>
          skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skill.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((skill) => skill.category === selectedCategory)
    }

    if (sortBy === "popular") {
      filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    return filtered
  }, [initialSkills, searchQuery, selectedCategory, sortBy])

  return (
    <div className="mb-8 space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl border-border/50 bg-card shadow-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "newest" | "popular")}
          className="rounded-xl border border-border/50 bg-card px-4 py-2 text-foreground shadow-sm"
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="rounded-full"
        >
          All Categories
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  )
}
