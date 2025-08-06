import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // WalletConnect
  VITE_WALLETCONNECT_PROJECT_ID: z.string().min(1, 'WalletConnect Project ID is required').default('a68601546569a5c135d1371332c35576'),
  
  // App Configuration
  VITE_APP_NAME: z.string().default('Pivot Protocol'),
  VITE_APP_URL: z.string().url().default('http://localhost:8082'),
  VITE_APP_DESCRIPTION: z.string().default('Advanced DeFi trading and portfolio management platform'),
  
  // RPC Endpoints (optional - fallback to public RPCs)
  VITE_ETHEREUM_RPC_URL: z.string().url().optional(),
  VITE_POLYGON_RPC_URL: z.string().url().optional(),
  VITE_ARBITRUM_RPC_URL: z.string().url().optional(),
  VITE_BSC_RPC_URL: z.string().url().optional(),
  
  // Feature Flags
  VITE_ENABLE_TESTNET: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_DEBUG_MODE: z.string().transform(val => val === 'true').default('false'),
  
  // API Configuration
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_COINGECKO_API_KEY: z.string().optional(),
  
  // Security
  VITE_TRUSTED_DOMAINS: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

// Validate and parse environment variables
const validateEnv = (): EnvConfig => {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
};

// Export validated configuration
export const config = validateEnv();

// Chain configurations with fallback RPCs
export const getChainConfig = () => {
  return [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: config.VITE_ETHEREUM_RPC_URL || 'https://ethereum.publicnode.com',
      blockExplorerUrl: 'https://etherscan.io'
    },
    {
      id: '0x89',
      token: 'MATIC',
      label: 'Polygon',
      rpcUrl: config.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
      blockExplorerUrl: 'https://polygonscan.com'
    },
    {
      id: '0xa4b1',
      token: 'ETH',
      label: 'Arbitrum One',
      rpcUrl: config.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      blockExplorerUrl: 'https://arbiscan.io'
    },
    {
      id: '0x38',
      token: 'BNB',
      label: 'BNB Smart Chain',
      rpcUrl: config.VITE_BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
      blockExplorerUrl: 'https://bscscan.com'
    }
  ];
};

// Testnet configurations (only included if enabled)
export const getTestnetChains = () => {
  if (!config.VITE_ENABLE_TESTNET) return [];
  
  return [
    {
      id: '0x5',
      token: 'ETH',
      label: 'Goerli Testnet',
      rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      blockExplorerUrl: 'https://goerli.etherscan.io'
    },
    {
      id: '0x13881',
      token: 'MATIC',
      label: 'Mumbai Testnet',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      blockExplorerUrl: 'https://mumbai.polygonscan.com'
    }
  ];
};

// Get all supported chains
export const getAllChains = () => {
  return [...getChainConfig(), ...getTestnetChains()];
};

// Trusted domains for security
export const getTrustedDomains = (): string[] => {
  if (!config.VITE_TRUSTED_DOMAINS) return [];
  return config.VITE_TRUSTED_DOMAINS.split(',').map(domain => domain.trim());
};

// App metadata for Web3-Onboard
export const getAppMetadata = () => ({
  name: config.VITE_APP_NAME,
  icon: '/icon.svg',
  logo: '/logo.svg',
  description: config.VITE_APP_DESCRIPTION,
  gettingStartedGuide: `${config.VITE_APP_URL}/getting-started`,
  explore: `${config.VITE_APP_URL}/explore`,
  recommendedInjectedWallets: [
    { name: 'MetaMask', url: 'https://metamask.io' },
    { name: 'Coinbase Wallet', url: 'https://wallet.coinbase.com/' },
    { name: 'Trust Wallet', url: 'https://trustwallet.com/' }
  ]
});

// Development utilities
export const isDevelopment = () => import.meta.env.DEV;
export const isProduction = () => import.meta.env.PROD;
export const isDebugMode = () => config.VITE_DEBUG_MODE;

// Logging utility that respects debug mode
export const debugLog = (...args: any[]) => {
  if (isDebugMode() || isDevelopment()) {
    console.log('[Pivot Protocol Debug]:', ...args);
  }
};

export const debugError = (...args: any[]) => {
  if (isDebugMode() || isDevelopment()) {
    console.error('[Pivot Protocol Error]:', ...args);
  }
};