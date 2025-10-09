import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated rate limiting service
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];

    // Filter out requests outside the current window
    const recentRequests = userRequests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= config.maxRequests) {
      this.requests.set(identifier, recentRequests);
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup(windowStart);
    }

    return true;
  }

  private cleanup(before: number): void {
    for (const [key, times] of this.requests.entries()) {
      const recent = times.filter(time => time > before);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }

  reset(): void {
    this.requests.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>,
  config: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }
) {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    // Get identifier (IP address or user ID from auth)
    const identifier = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    if (!rateLimiter.isAllowed(identifier, config)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(config.windowMs / 1000)),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Call the handler
    return handler(req, ...args);
  };
}

/**
 * Security headers for document-related routes
 */
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy for document downloads
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  
  // Permissions policy
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
} as const;

/**
 * Apply security headers to a response
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File, options?: {
  maxSize?: number;
  allowedTypes?: string[];
}): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize || 104857600; // 100MB default
  const allowedTypes = options?.allowedTypes || [];

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type if specified
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and other dangerous characters
  return filename
    .replace(/[\/\\]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/[<>:"|?*]/g, '_')
    .trim();
}

/**
 * Generate secure download token (for temporary file access)
 */
export function generateDownloadToken(
  documentId: string,
  userId: string,
  expiresIn: number = 3600 // 1 hour default
): string {
  // In production, use proper JWT or signed tokens
  // This is a simplified version
  const payload = {
    documentId,
    userId,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * Verify download token
 */
export function verifyDownloadToken(token: string): {
  valid: boolean;
  payload?: { documentId: string; userId: string; expiresAt: number };
  error?: string;
} {
  try {
    const payload = JSON.parse(
      Buffer.from(token, 'base64url').toString()
    );

    if (payload.expiresAt < Date.now()) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

export { rateLimiter };

