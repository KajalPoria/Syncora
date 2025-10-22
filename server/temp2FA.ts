// Temporary storage for 2FA authentication flow
// Maps nonce -> user credentials for staged authentication
interface PendingAuth {
  userId: string;
  email: string;
  expiresAt: number;
}

const pendingAuths = new Map<string, PendingAuth>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, auth] of pendingAuths.entries()) {
    if (auth.expiresAt < now) {
      pendingAuths.delete(nonce);
    }
  }
}, 5 * 60 * 1000);

export function createPendingAuth(userId: string, email: string): string {
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
  pendingAuths.set(nonce, {
    userId,
    email,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minute expiry
  });
  return nonce;
}

export function getPendingAuth(nonce: string): PendingAuth | undefined {
  const auth = pendingAuths.get(nonce);
  if (!auth) return undefined;
  
  if (auth.expiresAt < Date.now()) {
    pendingAuths.delete(nonce);
    return undefined;
  }
  
  return auth;
}

export function consumePendingAuth(nonce: string): PendingAuth | undefined {
  const auth = getPendingAuth(nonce);
  if (auth) {
    pendingAuths.delete(nonce);
  }
  return auth;
}
