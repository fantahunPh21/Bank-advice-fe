"use client"

/**
 * FileUploader component for handling file uploads
 */
const FileUploader = {
  /**
   * Upload a file to the specified endpoint
   * @param options - Upload options including endpoint, file, and entity data
   * @returns Promise that resolves to true if upload was successful, false otherwise
   */
  uploadFile: async ({ endpoint, file, entityData = "", uploadedImageNames = [] }) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("entityData", entityData)
    if (uploadedImageNames) {
      uploadedImageNames.forEach((name) => {
        formData.append("uploadedImages", name)
      })
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem("ce_token") || localStorage.getItem("authToken")
      if (!token) {
        console.error("Authentication token not found")
        return { status: false, content: "Authentication token not found" }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          // Don't set Content-Type for FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        console.error("File upload failed:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error details:", errorText)
        return { status: false, content: `Upload failed: ${response.status} ${response.statusText}` }
      }

      const data = await response.json()
      return { status: true, content: data.content }
    } catch (error) {
      console.error("File upload error:", error)
      return { status: false, content: error.message || "File upload failed" }
    }
  },

  uploadMultipleFiles: async ({ endpoint, files, entityData = [], uploadedImageNames = [] }) => {
    const uploadedNames = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const entity = entityData[i] || ""

      const result = await FileUploader.uploadFile({
        endpoint,
        file,
        entityData: entity,
        uploadedImageNames,
      })

      if (result.status) {
        uploadedNames.push(result.content)
      } else {
        console.error("Upload failed for a file:", result.content)
      }
    }

    return uploadedNames
  },
}

export default FileUploader
