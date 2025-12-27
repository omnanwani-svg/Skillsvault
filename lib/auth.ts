// Auth utilities
import { storage, type User } from "./mock-api"

export const isAuthenticated = (): boolean => {
  return storage.getUser() !== null
}

export const getCurrentUser = (): User | null => {
  return storage.getUser()
}

export const requireAuth = (callback: () => void) => {
  if (!isAuthenticated()) {
    window.location.href = "/login"
    return
  }
  callback()
}
