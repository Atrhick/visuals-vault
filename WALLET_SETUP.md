# Wallet Connect Setup Guide

This guide explains how to set up the wallet connect functionality for production use.

## 1. WalletConnect Configuration

### Get a Project ID
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create an account or sign in
3. Create a new project
4. Copy your Project ID

### Environment Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables:
   ```env
   VITE_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
   VITE_DEFAULT_CHAIN_ID=0x1
   VITE_API_BASE_URL=https://api.pivotprotocol.com
   ```

## 2. Supported Wallets

The implementation supports the following wallets:
- **MetaMask** - Browser extension and mobile app
- **WalletConnect** - Universal wallet connection protocol
- **Coinbase Wallet** - Coinbase's native wallet

## 3. Supported Networks

- **Ethereum Mainnet** (Chain ID: 0x1)
- **Polygon** (Chain ID: 0x89) 
- **Arbitrum** (Chain ID: 0xa4b1)
- **BNB Chain** (Chain ID: 0x38)

## 4. Features

### Authentication Flow
1. User clicks "Connect Wallet"
2. Web3-Onboard modal appears with wallet options
3. User selects and connects their wallet
4. System prompts for message signing for authentication
5. Session is created and stored locally
6. User is redirected to dashboard

### Session Management
- Sessions last 24 hours by default
- Sessions are automatically validated on page load
- Users are redirected to login if session expires
- Session includes wallet address and authentication token

### Security Features
- Message signing for authentication (no gas fees)
- Session validation on each page load
- Automatic logout on wallet disconnect
- Address verification against session data

## 5. Usage Examples

### Basic Wallet Connection
```tsx
import { useWallet } from '@/contexts/WalletContext';

function MyComponent() {
  const { isConnected, address, connect } = useWallet();
  
  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Protected Routes
```tsx
import { useWalletSession } from '@/hooks/useWalletSession';

function ProtectedPage() {
  useWalletSession({ 
    requireAuth: true, 
    redirectTo: '/' 
  });
  
  return <div>Protected content</div>;
}
```

### Wallet Status Display
```tsx
import WalletStatus from '@/components/WalletStatus';

function Header() {
  return (
    <header>
      <WalletStatus showBalance={true} compact={false} />
    </header>
  );
}
```

## 6. Error Handling

The system includes comprehensive error handling for:
- Connection failures
- Network switches
- Authentication rejections
- Session expiration
- Transaction errors

All errors are displayed to users with appropriate messages and recovery options.

## 7. Production Considerations

### Security
- Never expose private keys or mnemonics
- Always validate signatures on the backend
- Use HTTPS in production
- Implement rate limiting for authentication requests

### Performance
- Sessions are cached locally to avoid repeated authentication
- Wallet state is managed globally to prevent unnecessary re-renders
- Network requests are optimized with proper error handling

### User Experience
- Clear error messages and recovery instructions
- Loading states for all async operations
- Smooth transitions between authentication states
- Responsive design for mobile wallets