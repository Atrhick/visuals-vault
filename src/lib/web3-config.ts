import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import coinbaseModule from '@web3-onboard/coinbase';
import { config, getAllChains, getAppMetadata, debugLog, debugError } from './config';
import type { Chain } from '@web3-onboard/common';

// Export chains for use in other components
export const chains = getAllChains();

// Initialize wallet modules with basic configuration
const injected = injectedModule();

const walletConnect = walletConnectModule({
  projectId: config.VITE_WALLETCONNECT_PROJECT_ID,
  requiredChains: [1, 137, 42161, 56], // All mainnet chains
  optionalChains: chains.map(chain => parseInt(chain.id, 16)),
  dappUrl: config.VITE_APP_URL,
  additionalOptionalMethods: [
    'eth_signTypedData',
    'eth_signTypedData_v4',
    'personal_sign',
    'wallet_addEthereumChain',
    'wallet_switchEthereumChain'
  ]
});

const coinbase = coinbaseModule({
  darkMode: true
});

// Hardware wallets for production  
const ledger = ledgerModule({
  walletConnectVersion: 2,
  projectId: config.VITE_WALLETCONNECT_PROJECT_ID
});

const trezor = trezorModule({
  email: 'support@pivotprotocol.com',
  appUrl: config.VITE_APP_URL
});

// Get app metadata from config
const appMetadata = getAppMetadata();

// Initialize Web3 Onboard with production-ready configuration
export const web3Onboard = Onboard({
  wallets: [injected, walletConnect, coinbase, ledger, trezor],
  chains,
  appMetadata,
  accountCenter: {
    desktop: {
      enabled: false, // We use custom UI
      containerElement: 'body'
    },
    mobile: {
      enabled: false
    }
  },
  apiKey: config.VITE_WALLETCONNECT_PROJECT_ID,
  connect: {
    disableClose: false,
    removeWhereIsMyWalletWarning: true
  },
  notify: {
    enabled: false
  }
});

// Enhanced chain utilities
export const getChainById = (chainId: string) => {
  return chains.find(chain => chain.id === chainId);
};

export const isSupportedChain = (chainId: string) => {
  return chains.some(chain => chain.id === chainId);
};

export const getChainName = (chainId: string): string => {
  const chain = getChainById(chainId);
  return chain?.label || 'Unknown Network';
};

export const getChainToken = (chainId: string): string => {
  const chain = getChainById(chainId);
  return chain?.token || 'ETH';
};

export const getBlockExplorer = (chainId: string): string | undefined => {
  const chain = getChainById(chainId) as any;
  return chain?.blockExplorerUrl;
};

// Network validation helpers
export const isMainnet = (chainId: string): boolean => {
  return ['0x1', '0x89', '0xa4b1', '0x38'].includes(chainId);
};

export const isTestnet = (chainId: string): boolean => {
  return ['0x5', '0x13881'].includes(chainId);
};

// Add chain to wallet
export const addChainToWallet = async (chainId: string) => {
  const chain = getChainById(chainId);
  if (!chain) throw new Error('Unsupported chain');
  
  try {
    await web3Onboard.setChain({ chainId });
    return true;
  } catch (error) {
    debugError('Failed to add chain:', error);
    return false;
  }
};

// Initialize onboard with error handling
export const initializeOnboard = () => {
  try {
    debugLog('Initializing Web3-Onboard with config:', {
      chains: chains.length,
      wallets: ['injected', 'walletconnect', 'coinbase', 'ledger', 'trezor'],
      appName: appMetadata.name
    });
    return web3Onboard;
  } catch (error) {
    debugError('Failed to initialize Web3-Onboard:', error);
    throw new Error('Failed to initialize wallet connection system');
  }
};