import { ethers } from 'ethers';

export interface AuthSession {
  address: string;
  walletLabel: string;
  token: string;
  expires: number;
  chainId?: string;
}

export interface AuthChallenge {
  nonce: string;
  message: string;
  expires: number;
}

class AuthService {
  private static SESSION_KEY = 'pivot_auth_session';
  private static CHALLENGE_KEY = 'pivot_auth_challenge';
  private static SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  /**
   * Generate authentication challenge for wallet signing
   */
  static generateChallenge(address: string): AuthChallenge {
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const timestamp = new Date().toISOString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    const message = `Welcome to Pivot Protocol!

This request will not trigger a blockchain transaction or cost any gas fees.

Your authentication status will be stored for 24 hours.

Wallet address:
${address}

Nonce:
${nonce}

Timestamp:
${timestamp}`;
    
    const challenge: AuthChallenge = {
      nonce,
      message,
      expires
    };
    
    // Store challenge temporarily
    sessionStorage.setItem(this.CHALLENGE_KEY, JSON.stringify(challenge));
    
    return challenge;
  }
  
  /**
   * Verify signature and create session
   */
  static async verifySignature(
    address: string,
    signature: string,
    walletLabel: string,
    chainId?: string
  ): Promise<AuthSession | null> {
    try {
      console.log('Starting signature verification...', { address, walletLabel, chainId });
      
      // Get stored challenge
      const challengeStr = sessionStorage.getItem(this.CHALLENGE_KEY);
      if (!challengeStr) {
        console.error('No challenge found in sessionStorage');
        throw new Error('No authentication challenge found');
      }
      
      const challenge: AuthChallenge = JSON.parse(challengeStr);
      console.log('Challenge found:', { nonce: challenge.nonce, expires: challenge.expires });
      
      // Check if challenge expired
      if (Date.now() > challenge.expires) {
        console.error('Challenge expired:', { now: Date.now(), expires: challenge.expires });
        sessionStorage.removeItem(this.CHALLENGE_KEY);
        throw new Error('Authentication challenge expired');
      }
      
      // Log signature verification details
      console.log('Verifying signature:', { 
        signature: signature.slice(0, 10) + '...', 
        messageLength: challenge.message.length 
      });
      
      // Verify signature
      const recoveredAddress = ethers.verifyMessage(challenge.message, signature);
      console.log('Address recovered from signature:', recoveredAddress);
      console.log('Expected address:', address);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        console.error('Address mismatch:', { recovered: recoveredAddress, expected: address });
        throw new Error(`Invalid signature - recovered ${recoveredAddress} but expected ${address}`);
      }
      
      // Clear challenge
      sessionStorage.removeItem(this.CHALLENGE_KEY);
      
      // Create session
      const session: AuthSession = {
        address,
        walletLabel,
        token: ethers.keccak256(ethers.toUtf8Bytes(`${address}:${signature}:${challenge.nonce}`)),
        expires: Date.now() + this.SESSION_DURATION,
        chainId
      };
      
      console.log('Session created successfully:', { address: session.address, expires: new Date(session.expires) });
      
      // Store session
      this.saveSession(session);
      
      return session;
    } catch (error) {
      console.error('Signature verification failed:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      return null;
    }
  }
  
  /**
   * Get current session
   */
  static getSession(): AuthSession | null {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      if (!sessionStr) return null;
      
      const session: AuthSession = JSON.parse(sessionStr);
      
      // Check if session expired
      if (Date.now() > session.expires) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
  
  /**
   * Save session to storage
   */
  static saveSession(session: AuthSession): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }
  
  /**
   * Clear session
   */
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.CHALLENGE_KEY);
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
  
  /**
   * Update session with new chain ID
   */
  static updateSessionChain(chainId: string): void {
    const session = this.getSession();
    if (session) {
      session.chainId = chainId;
      this.saveSession(session);
    }
  }
  
  /**
   * Format address for display
   */
  static formatAddress(address: string, chars = 4): string {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  }
  
  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    try {
      ethers.getAddress(address);
      return true;
    } catch {
      return false;
    }
  }
}

export default AuthService;