// XSS Protection Utilities

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
export const escapeHtml = (text: string): string => {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Escapes CSS strings to prevent injection
 */
export const escapeCss = (str: string): string => {
  if (!str) return '';
  return str.replace(/[<>&"']/g, '');
};

/**
 * Validates and sanitizes input length
 */
export const validateLength = (input: string, maxLength: number): string => {
  if (!input) return '';
  return input.slice(0, maxLength);
};

/**
 * Sanitizes user input for safe display
 */
export const sanitizeInput = (input: string): string => {
  return escapeHtml(input);
};

/**
 * Validates file size
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  canProceed(action: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = `${action}`;
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(action: string): number {
    const record = this.attempts.get(action);
    if (!record) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }
}
