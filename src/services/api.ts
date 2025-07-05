import { auth } from '@/lib/firebase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

interface ApiResponse<T> {
  data?: T
  error?: string
}

async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser
    if (!user) return null
    return await user.getIdToken()
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getAuthToken()
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { error: data.error || 'An error occurred' }
    }
    
    return { data }
  } catch (error) {
    console.error('API call error:', error)
    return { error: 'Network error' }
  }
}

export const api = {
  agents: {
    list: () => apiCall<{ agents: any[]; user: any }>('/api/agents'),
    
    sendMessage: (agentId: string, message: string) =>
      apiCall<{ response: any }>(`/api/agents/${agentId}/message`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },
}