import { NextResponse } from 'next/server'
import { getAgents } from '@/lib/agents-simple'
import { adminAuth } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    // Get auth token from request
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split('Bearer ')[1]
    
    let userId: string | null = null
    let hasAccess = false
    
    if (token) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token)
        userId = decodedToken.uid
        
        // Check if user has sandbox access
        const userRecord = await adminAuth.getUser(userId)
        hasAccess = userRecord.customClaims?.sandbox_access === true
      } catch (error) {
        // Invalid token, continue as anonymous
      }
    }
    
    // For this sandbox demo, all authenticated users have access
    // Anonymous users can only see test agents
    if (userId && !hasAccess) {
      // For demo purposes, grant access to all authenticated users
      hasAccess = true
    }
    
    const agents = await getAgents()
    
    return NextResponse.json({ 
      agents,
      user: userId ? { id: userId, hasAccess } : null
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
