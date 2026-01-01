// Simple client-side hashing utility
// ⚠️ WARNING: This is NOT production-secure. For production, use server-side authentication
// with proper frameworks like Firebase Auth, NextAuth.js, or Auth0.
// Client-side hashing is vulnerable to brute-force attacks and should only be used for demos.

/**
 * Simple hash function using SHA-256 (if available via SubtleCrypto)
 * Falls back to a basic hash if SubtleCrypto is unavailable
 * WARNING: For production, replace with server-based authentication
 */
async function simpleHash(text: string): Promise<string> {
  try {
    // Try to use Web Crypto API if available
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hashHex
  } catch {
    // Fallback: simple base64 encoding (NOT secure, demo only)
    return btoa(text)
  }
}

/**
 * Verify a password against its hash
 * WARNING: For production, this verification must happen on the server
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  const computedHash = await simpleHash(plaintext)
  return computedHash === hash
}

/**
 * Hash a password for storage
 * WARNING: For production, this must happen on the server using bcrypt or similar
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return simpleHash(plaintext)
}
