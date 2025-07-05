'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [status, setStatus] = useState('Loading...')
  const [agents, setAgents] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testAPI() {
      try {
        setStatus('Fetching agents...')
        const response = await fetch('/api/agents')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setAgents(data.agents || [])
        setStatus(`Found ${data.agents?.length || 0} agents`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('Error!')
      }
    }
    
    testAPI()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Test Page</h1>
      <p>Status: {status}</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <h2>Agents:</h2>
      <ul>
        {agents.map((agent, i) => (
          <li key={i}>
            {agent.name} (ID: {agent.id})
          </li>
        ))}
      </ul>
      
      <hr />
      <a href="/">← Back to Home</a>
    </div>
  )
}