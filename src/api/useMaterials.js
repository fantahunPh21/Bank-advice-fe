import { useState, useEffect } from 'react'
import { API_BASE_URL } from './config'

export function useMaterials({ keyword = '', pageNumber = 0, pageSize = 10 } = {}) {
  const [data, setData] = useState({ content: [], pageable: {}, loading: true, error: null })

  useEffect(() => {
    setData(d => ({ ...d, loading: true, error: null }))
    const url = `${API_BASE_URL}/materials/fetch?pageNumber=${pageNumber}&pageSize=${pageSize}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('ce_token');
            localStorage.removeItem('ce_user');
            window.location.href = '/login';
            throw new Error('Session expired or access denied. Please log in again.');
          }
          throw new Error(await res.text());
        }
        return res.json()
      })
      .then((json) => {
        setData({ content: json.content || [], pageable: json.pageable || {}, loading: false, error: null })
      })
      .catch((err) => {
        setData(d => ({ ...d, loading: false, error: err.message || 'Failed to fetch materials' }))
      })
  }, [keyword, pageNumber, pageSize])

  return data
}
