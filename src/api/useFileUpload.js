import { useState } from 'react'
import { API_BASE_URL } from './config'
import { useAuth } from '../auth/AuthProvider'

export function useFileUpload() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const uploadFile = async (file, uploaderEmail) => {
    if (!file) return null
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/upload/file`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to upload file')
      }
      const result = await response.json()
      setData(result)
      return result // Expected to be a string or object with file path
    } catch (e) {
      setError(e)
      console.error('Upload Error:', e)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { uploadFile, loading, error, data }
}
