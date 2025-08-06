import { ethers } from 'ethers';
import { config, getTrustedDomains, debugLog, debugError } from './config';

// Security configuration
const SECURITY_CONFIG = {
  maxTransactionValue: ethers.parseEther('10'), // 10 ETH max per transaction
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  challengeTimeout: 5 * 60 * 1000, // 5 minutes
  maxSigningAttempts: 3,
  rateLimit: {
    requests: 10,
    window: 60 * 1000, // 1 minute
  },
};

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Suspicious activity tracking
const suspiciousActivityStore = new Map<string, {
  failedAttempts: number;
  lastAttempt: number;
  blocked: boolean;
  blockUntil?: number;
}>();

/**
 * Validate Ethereum address format and checksum
 */
export const validateAddress = (address: string): boolean => {
  try {
    const checksumAddress = ethers.getAddress(address);
    return checksumAddress === address;
  } catch {
    return false;
  }
};

/**
 * Sanitize and validate transaction data
 */
export const validateTransaction = (transaction: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  if (!transaction.to || !validateAddress(transaction.to)) {
    errors.push('Invalid recipient address');
  }
  
  // Validate value
  if (transaction.value) {
    try {
      const value = typeof transaction.value === 'string' 
        ? ethers.parseEther(transaction.value) 
        : transaction.value;
      
      if (value > SECURITY_CONFIG.maxTransactionValue) {
        errors.push(`Transaction value exceeds maximum allowed (${ethers.formatEther(SECURITY_CONFIG.maxTransactionValue)} ETH)`);
      }
      
      if (value < 0) {
        errors.push('Transaction value cannot be negative');
      }
    } catch {
      errors.push('Invalid transaction value');
    }
  }
  
  // Validate gas parameters
  if (transaction.gasLimit) {
    const gasLimit = BigInt(transaction.gasLimit);
    if (gasLimit > BigInt(10000000)) { // 10M gas limit
      errors.push('Gas limit too high - possible gas griefing attack');
    }
    if (gasLimit < BigInt(21000)) {
      errors.push('Gas limit too low for basic transaction');
    }
  }
  
  if (transaction.gasPrice) {
    const gasPrice = BigInt(transaction.gasPrice);
    const maxGasPrice = ethers.parseUnits('1000', 'gwei'); // 1000 gwei max
    if (gasPrice > maxGasPrice) {
      errors.push('Gas price too high - possible economic attack');
    }
  }
  
  // Check for suspicious data patterns
  if (transaction.data) {
    const data = transaction.data.toString();
    
    // Check for extremely long data (possible DoS)
    if (data.length > 100000) {
      errors.push('Transaction data too large');
    }
    
    // Check for known malicious patterns
    const suspiciousPatterns = [
      /0x608060405234801561001057600080fd5b50/, // Contract creation with suspicious bytecode
      /selfdestruct/i,
      /delegatecall/i,
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(data)) {
        errors.push('Transaction contains potentially dangerous operations');
        break;
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate and sanitize message for signing
 */
export const validateSigningMessage = (message: string): { valid: boolean; sanitized: string; warnings: string[] } => {
  const warnings: string[] = [];
  let sanitized = message;
  
  // Check message length
  if (message.length > 10000) {
    return {
      valid: false,
      sanitized: '',
      warnings: ['Message too long - possible DoS attempt'],
    };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    { pattern: /transfer.*approval/gi, warning: 'Message contains transfer/approval language' },
    { pattern: /sign.*transaction/gi, warning: 'Message requests transaction signing' },
    { pattern: /private.*key/gi, warning: 'Message mentions private keys' },
    { pattern: /seed.*phrase/gi, warning: 'Message mentions seed phrases' },
    { pattern: /password/gi, warning: 'Message requests password' },
    { pattern: /urgent.*act.*now/gi, warning: 'Message uses urgency tactics' },
  ];
  
  for (const { pattern, warning } of suspiciousPatterns) {
    if (pattern.test(message)) {
      warnings.push(warning);
    }
  }
  
  // Sanitize common injection attempts
  sanitized = sanitized
    .replace(/<script[^>]*>.*?<\/script>/gi, '[SCRIPT REMOVED]')
    .replace(/javascript:/gi, '[JAVASCRIPT REMOVED]')
    .replace(/data:text\/html/gi, '[DATA URL REMOVED]');
  
  return {
    valid: warnings.length < 3, // Allow up to 2 warnings
    sanitized,
    warnings,
  };
};

/**
 * Rate limiting implementation
 */
export const checkRateLimit = (identifier: string): { allowed: boolean; resetIn?: number } => {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  const existing = rateLimitStore.get(key);
  
  if (!existing || now > existing.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + SECURITY_CONFIG.rateLimit.window,
    });
    return { allowed: true };
  }
  
  if (existing.count >= SECURITY_CONFIG.rateLimit.requests) {
    return {
      allowed: false,
      resetIn: existing.resetTime - now,
    };
  }
  
  // Increment counter
  existing.count++;
  rateLimitStore.set(key, existing);
  
  return { allowed: true };
};

/**
 * Track and detect suspicious activity
 */
export const trackSuspiciousActivity = (
  identifier: string, 
  activityType: 'failed_auth' | 'failed_transaction' | 'invalid_signature' | 'rate_limit_exceeded'
): { blocked: boolean; blockDuration?: number } => {
  const now = Date.now();
  const existing = suspiciousActivityStore.get(identifier);
  
  if (!existing) {
    suspiciousActivityStore.set(identifier, {
      failedAttempts: 1,
      lastAttempt: now,
      blocked: false,
    });
    return { blocked: false };
  }
  
  // Check if still blocked
  if (existing.blocked && existing.blockUntil && now < existing.blockUntil) {
    return {
      blocked: true,
      blockDuration: existing.blockUntil - now,
    };
  }
  
  // Reset if enough time has passed
  if (now - existing.lastAttempt > 60 * 60 * 1000) { // 1 hour reset
    existing.failedAttempts = 1;
    existing.blocked = false;
    existing.blockUntil = undefined;
  } else {
    existing.failedAttempts++;
  }
  
  existing.lastAttempt = now;
  
  // Block if too many attempts
  if (existing.failedAttempts >= 5) {
    const blockDuration = Math.min(30 * 60 * 1000 * Math.pow(2, existing.failedAttempts - 5), 24 * 60 * 60 * 1000); // Exponential backoff, max 24h
    existing.blocked = true;
    existing.blockUntil = now + blockDuration;
    
    debugError(`Blocking suspicious activity from ${identifier} for ${blockDuration}ms`);
    
    return {
      blocked: true,
      blockDuration,
    };
  }
  
  suspiciousActivityStore.set(identifier, existing);
  return { blocked: false };
};

/**
 * Validate origin and referrer for security
 */
export const validateOrigin = (): { valid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Check if running in expected domain
  const currentOrigin = window.location.origin;
  const trustedDomains = getTrustedDomains();
  
  if (trustedDomains.length > 0 && !trustedDomains.some(domain => currentOrigin.includes(domain))) {
    warnings.push(`Application running on untrusted domain: ${currentOrigin}`);
  }
  
  // Check referrer
  if (document.referrer) {
    const referrerUrl = new URL(document.referrer);
    if (!trustedDomains.some(domain => referrerUrl.hostname.includes(domain))) {
      warnings.push(`Suspicious referrer: ${document.referrer}`);
    }
  }
  
  // Check for iframe embedding
  if (window !== window.top) {
    warnings.push('Application is running in an iframe - potential clickjacking risk');
  }
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
};

/**
 * Generate secure random nonce
 */
export const generateSecureNonce = (): string => {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');
};

/**
 * Secure session token validation
 */
export const validateSessionToken = (token: string): boolean => {
  try {
    // Check token format (should be a valid hex string)
    if (!/^0x[a-fA-F0-9]{64}$/.test(token)) {
      return false;
    }
    
    // Additional entropy check
    const bytes = ethers.getBytes(token);
    const uniqueBytes = new Set(bytes).size;
    
    // Should have reasonable entropy (at least 20 unique bytes out of 32)
    if (uniqueBytes < 20) {
      debugError('Session token has low entropy');
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Content Security Policy validation
 */
export const validateCSP = (): { compliant: boolean; recommendations: string[] } => {
  const recommendations: string[] = [];
  
  // Check if CSP header is present
  const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
  
  if (metaTags.length === 0) {
    recommendations.push('Add Content-Security-Policy meta tag or header');
  } else {
    const cspContent = metaTags[0].getAttribute('content') || '';
    
    // Check for essential directives
    const requiredDirectives = [
      { directive: "default-src 'self'", check: /default-src[^;]*'self'/ },
      { directive: "script-src 'self'", check: /script-src[^;]*'self'/ },
      { directive: "object-src 'none'", check: /object-src[^;]*'none'/ },
      { directive: 'upgrade-insecure-requests', check: /upgrade-insecure-requests/ },
    ];
    
    for (const { directive, check } of requiredDirectives) {
      if (!check.test(cspContent)) {
        recommendations.push(`Add CSP directive: ${directive}`);
      }
    }
  }
  
  return {
    compliant: recommendations.length === 0,
    recommendations,
  };
};

/**
 * Initialize security monitoring
 */
export const initializeSecurity = (): void => {
  debugLog('Initializing security monitoring');
  
  // Validate current environment
  const originValidation = validateOrigin();
  if (!originValidation.valid) {
    debugError('Origin validation failed:', originValidation.warnings);
  }
  
  const cspValidation = validateCSP();
  if (!cspValidation.compliant) {
    debugLog('CSP recommendations:', cspValidation.recommendations);
  }
  
  // Set up global error monitoring
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message) {
      debugError('Global error caught:', event.error);
      
      // Track potential security-related errors
      if (event.error.message.includes('Content Security Policy') ||
          event.error.message.includes('Mixed Content') ||
          event.error.message.includes('CORS')) {
        trackSuspiciousActivity('security_error', 'failed_auth');
      }
    }
  });
  
  // Monitor for suspicious DOM modifications
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for suspicious script injections
              if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-pivot-approved')) {
                debugError('Suspicious script injection detected:', element);
                element.remove();
              }
              
              // Check for iframe injections
              if (element.tagName === 'IFRAME' && !element.hasAttribute('data-pivot-approved')) {
                debugError('Suspicious iframe injection detected:', element);
                element.remove();
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
  
  debugLog('Security monitoring initialized');
};

// Export security configuration for reference
export { SECURITY_CONFIG };