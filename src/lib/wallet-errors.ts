export enum WalletErrorCode {
  // Connection errors
  NO_WALLET = 'NO_WALLET',
  CONNECTION_REJECTED = 'CONNECTION_REJECTED',
  ALREADY_CONNECTED = 'ALREADY_CONNECTED',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  
  // Authentication errors
  AUTH_REJECTED = 'AUTH_REJECTED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Transaction errors
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  NONCE_TOO_LOW = 'NONCE_TOO_LOW',
  GAS_ESTIMATION_FAILED = 'GAS_ESTIMATION_FAILED',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  RPC_ERROR = 'RPC_ERROR',
  CHAIN_SWITCH_REJECTED = 'CHAIN_SWITCH_REJECTED',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  TIMEOUT = 'TIMEOUT',
}

export class WalletError extends Error {
  constructor(
    public code: WalletErrorCode,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

export const parseWalletError = (error: any): WalletError => {
  // Check if already a WalletError
  if (error instanceof WalletError) {
    return error;
  }
  
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  const errorCode = error?.code;
  
  // Connection errors
  if (errorMessage.includes('No wallet') || errorMessage.includes('not installed')) {
    return new WalletError(
      WalletErrorCode.NO_WALLET,
      'No wallet detected. Please install MetaMask or another Web3 wallet.',
      error
    );
  }
  
  if (errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
    if (errorMessage.includes('transaction')) {
      return new WalletError(
        WalletErrorCode.TRANSACTION_REJECTED,
        'Transaction was rejected by the user.',
        error
      );
    }
    return new WalletError(
      WalletErrorCode.CONNECTION_REJECTED,
      'Connection request was rejected.',
      error
    );
  }
  
  if (errorMessage.includes('Already connected')) {
    return new WalletError(
      WalletErrorCode.ALREADY_CONNECTED,
      'Wallet is already connected.',
      error
    );
  }
  
  // Chain errors
  if (errorMessage.includes('Unsupported chain') || errorMessage.includes('network')) {
    return new WalletError(
      WalletErrorCode.UNSUPPORTED_CHAIN,
      'The selected network is not supported. Please switch to a supported network.',
      error
    );
  }
  
  if (errorMessage.includes('wallet_switchEthereumChain')) {
    return new WalletError(
      WalletErrorCode.CHAIN_SWITCH_REJECTED,
      'Network switch was rejected.',
      error
    );
  }
  
  // Authentication errors
  if (errorMessage.includes('signature') || errorMessage.includes('sign')) {
    return new WalletError(
      WalletErrorCode.AUTH_REJECTED,
      'Message signing was rejected.',
      error
    );
  }
  
  // Transaction errors
  if (errorMessage.includes('insufficient funds') || errorMessage.includes('balance too low')) {
    return new WalletError(
      WalletErrorCode.INSUFFICIENT_FUNDS,
      'Insufficient funds for this transaction.',
      error
    );
  }
  
  if (errorMessage.includes('nonce too low')) {
    return new WalletError(
      WalletErrorCode.NONCE_TOO_LOW,
      'Transaction nonce is too low. Please try again.',
      error
    );
  }
  
  if (errorMessage.includes('gas required exceeds') || errorMessage.includes('gas estimation')) {
    return new WalletError(
      WalletErrorCode.GAS_ESTIMATION_FAILED,
      'Failed to estimate gas for this transaction.',
      error
    );
  }
  
  // Network errors
  if (errorCode === -32603 || errorMessage.includes('RPC')) {
    return new WalletError(
      WalletErrorCode.RPC_ERROR,
      'Network communication error. Please try again.',
      error
    );
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return new WalletError(
      WalletErrorCode.TIMEOUT,
      'Request timed out. Please try again.',
      error
    );
  }
  
  // Default
  return new WalletError(
    WalletErrorCode.UNKNOWN_ERROR,
    errorMessage,
    error
  );
};

export const getErrorMessage = (error: WalletError | Error | any): string => {
  if (error instanceof WalletError) {
    return error.message;
  }
  
  const walletError = parseWalletError(error);
  return walletError.message;
};

export const isUserRejection = (error: any): boolean => {
  const walletError = parseWalletError(error);
  return [
    WalletErrorCode.CONNECTION_REJECTED,
    WalletErrorCode.AUTH_REJECTED,
    WalletErrorCode.TRANSACTION_REJECTED,
    WalletErrorCode.CHAIN_SWITCH_REJECTED,
  ].includes(walletError.code);
};

export const isRecoverableError = (error: any): boolean => {
  const walletError = parseWalletError(error);
  return [
    WalletErrorCode.NETWORK_ERROR,
    WalletErrorCode.RPC_ERROR,
    WalletErrorCode.TIMEOUT,
    WalletErrorCode.NONCE_TOO_LOW,
    WalletErrorCode.GAS_ESTIMATION_FAILED,
  ].includes(walletError.code);
};