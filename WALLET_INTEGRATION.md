# Production-Ready Wallet Integration

This document outlines the comprehensive wallet integration system implemented for Pivot Protocol, designed for production use in professional DeFi applications.

## Overview

The wallet integration provides:
- ✅ **Multi-wallet support** (MetaMask, WalletConnect, Coinbase, Ledger, Trezor)
- ✅ **Production-grade security** with comprehensive validation
- ✅ **Network monitoring** and automatic reconnection
- ✅ **Advanced authentication** with secure session management
- ✅ **Transaction management** with gas optimization
- ✅ **Error handling** with user-friendly messages
- ✅ **State persistence** and recovery across sessions

## Key Components

### 1. Configuration Management (`src/lib/config.ts`)
- Environment variable validation using Zod schemas
- Support for multiple RPC endpoints with fallbacks
- Feature flags for development/production modes
- Secure configuration with validation

### 2. Web3-Onboard Configuration (`src/lib/web3-config.ts`)
- Production-ready wallet module initialization
- Support for 5+ major wallet types including hardware wallets
- Enhanced chain configuration with block explorers
- Custom theming to match application design

### 3. Wallet Context (`src/contexts/WalletContext.tsx`)
- Comprehensive state management for wallet connections
- Automatic session recovery and persistence
- Enhanced error handling with typed error system
- Network monitoring integration

### 4. Authentication Service (`src/services/authService.ts`)
- Secure message signing for authentication
- Session management with expiration handling
- Signature verification and nonce generation
- Address validation and formatting utilities

### 5. Security Framework (`src/lib/security.ts`)
- Transaction validation and sanitization
- Rate limiting and suspicious activity detection
- Content Security Policy validation
- Origin validation and security monitoring

### 6. Network Monitoring (`src/hooks/useNetworkMonitor.ts`)
- Real-time network health monitoring
- Automatic reconnection with exponential backoff
- RPC latency monitoring
- Connection quality indicators

### 7. Transaction Management (`src/hooks/useTransactionManager.ts`)
- Gas optimization with EIP-1559 support
- Transaction monitoring and status tracking
- Speed-up and cancellation capabilities
- Comprehensive error handling

## Setup Instructions

### 1. Install Dependencies

The required packages are already included in `package.json`:

```json
{
  "@web3-onboard/coinbase": "^2.4.2",
  "@web3-onboard/core": "^2.24.1",
  "@web3-onboard/injected-wallets": "^2.11.3",
  "@web3-onboard/ledger": "^2.7.1",
  "@web3-onboard/trezor": "^2.4.7",
  "@web3-onboard/walletconnect": "^2.6.2",
  "ethers": "^6.15.0",
  "zod": "^3.23.8"
}
```

Install with:
```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```env
# Required: Get from https://cloud.walletconnect.com/
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# App Configuration
VITE_APP_NAME="Pivot Protocol"
VITE_APP_URL="http://localhost:8082"

# Optional: Custom RPC endpoints (recommended for production)
VITE_ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"
VITE_POLYGON_RPC_URL="https://polygon-mainnet.infura.io/v3/YOUR_KEY"

# Feature flags
VITE_ENABLE_TESTNET=false
VITE_DEBUG_MODE=false

# Security (production)
VITE_TRUSTED_DOMAINS="yourdomain.com,app.yourdomain.com"
```

### 3. Initialize Wallet Provider

Wrap your app with the WalletProvider:

```tsx
import { WalletProvider } from '@/contexts/WalletContext';
import { initializeSecurity } from '@/lib/security';

function App() {
  useEffect(() => {
    // Initialize security monitoring
    initializeSecurity();
  }, []);

  return (
    <WalletProvider>
      {/* Your app components */}
    </WalletProvider>
  );
}
```

### 4. Use Wallet Components

```tsx
import WalletStatus from '@/components/WalletStatus';

function Header() {
  return (
    <div className="header">
      <WalletStatus 
        compact={true}
        showNetworkStatus={true}
        enableAuthentication={true}
      />
    </div>
  );
}
```

## Usage Examples

### Basic Wallet Connection

```tsx
import { useWallet } from '@/contexts/WalletContext';

function MyComponent() {
  const { 
    isConnected, 
    address, 
    connect, 
    disconnect,
    isAuthenticated,
    authenticate 
  } = useWallet();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      {!isAuthenticated && (
        <button onClick={authenticate}>Authenticate</button>
      )}
    </div>
  );
}
```

### Transaction Management

```tsx
import { useTransactionManager } from '@/hooks/useTransactionManager';

function SendTransaction() {
  const { sendTransaction, estimateGas } = useTransactionManager();

  const handleSend = async () => {
    try {
      // Estimate gas first
      const gasEstimation = await estimateGas({
        to: '0x...',
        value: ethers.parseEther('0.1'),
      });

      // Send transaction
      const hash = await sendTransaction({
        to: '0x...',
        value: ethers.parseEther('0.1'),
      }, gasEstimation);

      console.log('Transaction sent:', hash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return <button onClick={handleSend}>Send Transaction</button>;
}
```

### Network Monitoring

```tsx
import { useNetworkMonitor } from '@/hooks/useNetworkMonitor';

function NetworkStatus() {
  const { networkStatus, isHealthy, latencyStatus } = useNetworkMonitor();

  return (
    <div>
      <span>Network: {isHealthy ? '🟢' : '🔴'}</span>
      <span>Latency: {latencyStatus}</span>
      <span>RPC: {networkStatus.isConnectedToRPC ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}
```

## Security Features

### 1. Transaction Validation
- Automatic validation of transaction parameters
- Gas limit and price safety checks
- Malicious pattern detection
- Value limits and sanity checks

### 2. Authentication Security
- Challenge-response authentication
- Secure nonce generation
- Session token validation
- Signature verification

### 3. Network Security
- Origin validation
- Content Security Policy enforcement
- Rate limiting on wallet operations
- Suspicious activity detection

### 4. Error Handling
- Typed error system with specific error codes
- User-friendly error messages
- Automatic retry for recoverable errors
- Graceful degradation

## Production Deployment

### 1. Environment Variables
Ensure all required environment variables are set:
- `VITE_WALLETCONNECT_PROJECT_ID` - Required for WalletConnect
- `VITE_ETHEREUM_RPC_URL` - Custom RPC endpoint (recommended)
- `VITE_TRUSTED_DOMAINS` - Security validation

### 2. Security Headers
Add these headers to your server configuration:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; object-src 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### 3. Analytics (Optional)
Enable analytics in production:

```env
VITE_ENABLE_ANALYTICS=true
```

### 4. Monitoring
The system includes built-in monitoring for:
- Connection health
- Transaction success rates
- Error frequencies
- Network latency

## Troubleshooting

### Common Issues

1. **WalletConnect Connection Failed**
   - Verify `VITE_WALLETCONNECT_PROJECT_ID` is set correctly
   - Check network connectivity
   - Ensure HTTPS in production

2. **Transaction Failures**
   - Check gas estimation
   - Verify network connection
   - Confirm sufficient balance

3. **Authentication Issues**
   - Clear browser storage
   - Check session expiration
   - Verify signature validation

### Debug Mode
Enable debug mode for development:

```env
VITE_DEBUG_MODE=true
```

This will show detailed logging in the browser console.

## API Reference

### useWallet Hook
Primary hook for wallet operations:
- `connect()` - Connect wallet
- `disconnect()` - Disconnect wallet
- `switchChain(chainId)` - Switch networks
- `authenticate()` - Authenticate user
- `signMessage(message)` - Sign message
- `sendTransaction(tx)` - Send transaction

### useTransactionManager Hook
Advanced transaction management:
- `sendTransaction(tx, gasOptions)` - Send with gas optimization
- `estimateGas(tx, priority)` - Estimate gas costs
- `speedUpTransaction(hash)` - Speed up pending transaction
- `cancelTransaction(hash)` - Cancel pending transaction

### useNetworkMonitor Hook
Network health monitoring:
- `networkStatus` - Current network status
- `isHealthy` - Overall health indicator
- `forceRefresh()` - Manual health check
- `manualReconnect()` - Force reconnection

## Contributing

When contributing to the wallet integration:

1. Follow the existing error handling patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure security considerations are addressed
5. Test with multiple wallet types

## Security Considerations

- Never log private keys or sensitive data
- Validate all user inputs
- Use HTTPS in production
- Implement proper CORS policies
- Regular security audits recommended
- Monitor for suspicious activity

This wallet integration provides enterprise-grade functionality suitable for production DeFi applications while maintaining excellent user experience and security standards.