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

// Get app metadata from config
const appMetadata = getAppMetadata();

// Initialize Web3 Onboard with production-ready configuration
// Hardware wallets removed for Cloud Run deployment
export const web3Onboard = Onboard({
  wallets: [injected, walletConnect, coinbase],
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

// Helper function to check if a chain is supported
export const isSupportedChain = (chainId: string): boolean => {
  return chains.some(chain => chain.id === chainId);
};

// Helper function to get chain information
export const getChainInfo = (chainId: string) => {
  return chains.find(chain => chain.id === chainId);
};

// Get chain name helper
export const getChainName = (chainId: string): string => {
  const chain = getChainInfo(chainId);
  return chain?.label || 'Unknown Network';
};

// Get chain token helper  
export const getChainToken = (chainId: string): string => {
  const chain = getChainInfo(chainId);
  return chain?.token || 'ETH';
};

// Get block explorer URL
export const getBlockExplorer = (chainId: string): string | undefined => {
  const chain = getChainInfo(chainId);
  return chain?.blockExplorerUrl;
};

// Helper to add a chain to the user's wallet
export const addChainToWallet = async (chainId: string): Promise<boolean> => {
  try {
    const chain = getChainInfo(chainId);
    if (!chain) {
      throw new Error('Chain not found');
    }

    const success = await web3Onboard.setChain({ chainId });
    if (success) {
      debugLog(`Successfully added chain ${chain.label}`);
    }
    return success;
  } catch (error) {
    debugError('Error adding chain to wallet:', error);
    return false;
  }
};

// Production-safe disconnect function
export const disconnectWallet = async () => {
  try {
    const connectedWallets = web3Onboard.state.get().wallets;
    if (connectedWallets.length > 0) {
      await web3Onboard.disconnectWallet({ label: connectedWallets[0].label });
    }
  } catch (error) {
    debugError('Error disconnecting wallet:', error);
  }
};