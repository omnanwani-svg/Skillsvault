export async function uploadVideo(file: File, skillId: string): Promise<{ success: boolean; message: string }> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("skillId", skillId)

  const response = await fetch("/api/upload/video", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload video")
  }

  return response.json()
}

export async function uploadCertificate(file: File, skillId: string): Promise<{ success: boolean; message: string }> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("skillId", skillId)

  const response = await fetch("/api/upload/certificate", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload certificate")
  }

  return response.json()
}
