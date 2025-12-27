"use client"

import { useToast } from "@/hooks/use-toast"

export function useNotifications() {
  const { toast } = useToast()

  const notifyRequestReceived = (skillTitle: string, fromUser: string) => {
    toast({
      title: "New Request Received",
      description: `${fromUser} wants to learn ${skillTitle}`,
      duration: 5000,
    })
  }

  const notifyRequestAccepted = (skillTitle: string) => {
    toast({
      title: "Request Accepted!",
      description: `Your request for ${skillTitle} has been accepted`,
      duration: 5000,
    })
  }

  const notifyMessageReceived = (fromUser: string) => {
    toast({
      title: "New Message",
      description: `You have a new message from ${fromUser}`,
      duration: 5000,
    })
  }

  const notifySuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
      duration: 3000,
    })
  }

  const notifyError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
      duration: 5000,
    })
  }

  return {
    notifyRequestReceived,
    notifyRequestAccepted,
    notifyMessageReceived,
    notifySuccess,
    notifyError,
  }
}
