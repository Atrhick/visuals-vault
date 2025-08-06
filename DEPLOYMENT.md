# Deployment Guide

## Prerequisites

### 1. Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Sign up or sign in
3. Create a new project
4. Copy your Project ID

### 2. Configure Cloud Build Variables

In your Google Cloud Console:

1. Go to Cloud Build > Triggers
2. Find your trigger for this repository  
3. Click "Edit"
4. Go to "Advanced" section
5. Add substitution variables:

```
_VITE_WALLETCONNECT_PROJECT_ID = your_actual_walletconnect_project_id
_VITE_APP_URL = https://your-cloud-run-url.com
```

### 3. Manual Cloud Build Trigger (Alternative)

You can also trigger a build manually with environment variables:

```bash
gcloud builds submit \
  --substitutions=_VITE_WALLETCONNECT_PROJECT_ID="your_project_id_here",_VITE_APP_URL="https://your-app-url.com" \
  .
```

## Environment Variables

The following environment variables are embedded at build time:

### Required
- `VITE_WALLETCONNECT_PROJECT_ID` - Your WalletConnect project ID

### Optional  
- `VITE_APP_URL` - Your application URL (defaults to localhost)
- `VITE_APP_NAME` - App name (defaults to "Pivot Protocol")
- `VITE_ENABLE_TESTNET` - Enable testnet chains (default: false)
- `VITE_DEBUG_MODE` - Enable debug logging (default: false)

### Custom RPC URLs (Optional)
- `VITE_ETHEREUM_RPC_URL` - Custom Ethereum RPC
- `VITE_POLYGON_RPC_URL` - Custom Polygon RPC  
- `VITE_ARBITRUM_RPC_URL` - Custom Arbitrum RPC
- `VITE_BSC_RPC_URL` - Custom BSC RPC

## Current Status

✅ **Container builds successfully**  
✅ **Deploys to Cloud Run**  
⚠️  **Needs WalletConnect Project ID to function**

The app currently uses a placeholder for the WalletConnect Project ID. Wallet connections will not work until a real Project ID is configured.

## Quick Fix

To get the app working immediately:

1. Get your WalletConnect Project ID from https://cloud.walletconnect.com/
2. Update the Cloud Build trigger substitution variables
3. Push a new commit or manually trigger a rebuild

The app will then be fully functional with wallet connectivity!