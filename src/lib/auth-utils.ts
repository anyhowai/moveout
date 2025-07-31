import { NextRequest } from 'next/server'

/**
 * Extract and verify Firebase ID token from request headers
 * @param request - Next.js request object
 * @returns The verified user ID or null if authentication fails
 */
export async function verifyAuthToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.split('Bearer ')[1]
    
    if (!token) {
      return null
    }
    
    // Note: For production, you should use Firebase Admin SDK to verify tokens
    // For now, we'll do basic token validation on the client side
    // This is a simplified approach for the MVP
    
    // In a real production app, you would do:
    // const admin = require('firebase-admin')
    // const decodedToken = await admin.auth().verifyIdToken(token)
    // return decodedToken.uid
    
    // For MVP, we trust the client-side authentication
    // The token should contain the user ID in a predictable format
    // This is not secure for production but works for demo purposes
    
    return null // Will implement proper server-side verification later
  } catch (error) {
    console.error('Error verifying auth token:', error)
    return null
  }
}

/**
 * Extract user ID from request and verify it matches the authenticated user
 * @param request - Next.js request object
 * @param providedUserId - User ID provided in request params/body
 * @returns True if the user is authenticated and matches the provided ID
 */
export async function verifyUserAccess(request: NextRequest, providedUserId: string): Promise<boolean> {
  // For MVP, we'll do basic header validation
  // In production, this should verify the Firebase ID token
  
  const authHeader = request.headers.get('authorization')
  const userIdHeader = request.headers.get('x-user-id')
  
  // Check if user is authenticated (has auth header)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  // Check if the user ID in header matches the provided user ID
  if (userIdHeader !== providedUserId) {
    return false
  }
  
  return true
}