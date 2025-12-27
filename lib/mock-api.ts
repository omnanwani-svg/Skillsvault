// Mock API for time banking app - simulates backend calls

export interface User {
  id: string
  name: string
  email: string
  timeBalance: number
  avatar?: string
}

export interface Skill {
  id: string
  userId: string
  userName: string
  title: string
  description: string
  hoursOffered: number
  category: string
  createdAt: string
  certificateUrl?: string
  demoVideoUrl?: string
  demoVideoFile?: string // Added file-based video support
  certification?: string // Added certification field
  verificationStatus: "pending" | "verified" | "rejected"
  rating: number
  ratingCount: number
}

export interface Request {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  skillId: string
  skillTitle: string
  hours: number
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

export interface Transaction {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  skillTitle: string
  hours: number
  type: "earned" | "spent"
  createdAt: string
}

// Mock data
const MOCK_SKILLS: Skill[] = [
  {
    id: "1",
    userId: "2",
    userName: "kaif khan",
    title: "Web Development",
    description: "I can help build responsive websites using React and Tailwind CSS",
    hoursOffered: 5,
    category: "Technology",
    createdAt: new Date().toISOString(),
    verificationStatus: "verified",
    rating: 4.8,
    ratingCount: 12,
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "2",
    userId: "3",
    userName: "om nanwani",
    title: "Graphic Design",
    description: "Logo design, branding, and visual identity creation",
    hoursOffered: 3,
    category: "Design",
    createdAt: new Date().toISOString(),
    verificationStatus: "verified",
    rating: 4.9,
    ratingCount: 8,
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "3",
    userId: "4",
    userName: "abhishek jaiswal",
    title: "Language Tutoring",
    description: "Spanish and French tutoring for all levels",
    hoursOffered: 4,
    category: "Education",
    createdAt: new Date().toISOString(),
    verificationStatus: "pending",
    rating: 0,
    ratingCount: 0,
  },
  {
    id: "4",
    userId: "5",
    userName: "Samrat",
    title: "Home Repairs",
    description: "Basic plumbing, electrical work, and carpentry",
    hoursOffered: 6,
    category: "Home Services",
    createdAt: new Date().toISOString(),
    verificationStatus: "verified",
    rating: 4.7,
    ratingCount: 15,
  },
]

// Storage helpers
export const storage = {
  getUser: (): User | null => {
    const user = localStorage.getItem("timebank_user")
    return user ? JSON.parse(user) : null
  },
  setUser: (user: User) => {
    localStorage.setItem("timebank_user", JSON.stringify(user))
  },
  clearUser: () => {
    localStorage.removeItem("timebank_user")
  },
  getSkills: (): Skill[] => {
    const skills = localStorage.getItem("timebank_skills")
    return skills ? JSON.parse(skills) : MOCK_SKILLS
  },
  setSkills: (skills: Skill[]) => {
    localStorage.setItem("timebank_skills", JSON.stringify(skills))
  },
  getRequests: (): Request[] => {
    const requests = localStorage.getItem("timebank_requests")
    return requests ? JSON.parse(requests) : []
  },
  setRequests: (requests: Request[]) => {
    localStorage.setItem("timebank_requests", JSON.stringify(requests))
  },
  getTransactions: (): Transaction[] => {
    const transactions = localStorage.getItem("timebank_transactions")
    return transactions ? JSON.parse(transactions) : []
  },
  setTransactions: (transactions: Transaction[]) => {
    localStorage.setItem("timebank_transactions", JSON.stringify(transactions))
  },
}

// Mock API functions
export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock login - accept any email/password
    const user: User = {
      id: "1",
      name: email.split("@")[0],
      email,
      timeBalance: 10,
    }

    storage.setUser(user)
    return user
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user: User = {
      id: Date.now().toString(),
      name,
      email,
      timeBalance: 10, // Starting balance
    }

    storage.setUser(user)
    return user
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    storage.clearUser()
  },

  // Skills
  getSkills: async (): Promise<Skill[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return storage.getSkills()
  },

  addSkill: async (skill: Omit<Skill, "id" | "createdAt">): Promise<Skill> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newSkill: Skill = {
      ...skill,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    const skills = storage.getSkills()
    skills.unshift(newSkill)
    storage.setSkills(skills)

    return newSkill
  },

  updateSkillVideo: async (skillId: string, videoFile: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const skills = storage.getSkills()
    const skill = skills.find((s) => s.id === skillId)

    if (skill) {
      skill.demoVideoFile = videoFile
      storage.setSkills(skills)
    }
  },

  // Requests
  getRequests: async (): Promise<Request[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return storage.getRequests()
  },

  createRequest: async (request: Omit<Request, "id" | "createdAt" | "status">): Promise<Request> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newRequest: Request = {
      ...request,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    const requests = storage.getRequests()
    requests.unshift(newRequest)
    storage.setRequests(requests)

    return newRequest
  },

  acceptRequest: async (requestId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const requests = storage.getRequests()
    const request = requests.find((r) => r.id === requestId)

    if (request) {
      request.status = "accepted"
      storage.setRequests(requests)

      // Update user balance
      const user = storage.getUser()
      if (user) {
        user.timeBalance += request.hours
        storage.setUser(user)
      }

      // Add transaction
      const transactions = storage.getTransactions()
      transactions.unshift({
        id: Date.now().toString(),
        fromUserId: request.fromUserId,
        fromUserName: request.fromUserName,
        toUserId: request.toUserId,
        toUserName: request.toUserName,
        skillTitle: request.skillTitle,
        hours: request.hours,
        type: "earned",
        createdAt: new Date().toISOString(),
      })
      storage.setTransactions(transactions)
    }
  },

  rejectRequest: async (requestId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const requests = storage.getRequests()
    const request = requests.find((r) => r.id === requestId)

    if (request) {
      request.status = "rejected"
      storage.setRequests(requests)
    }
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return storage.getTransactions()
  },
}
