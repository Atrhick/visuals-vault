# Multi-stage build for React application
FROM node:18-alpine as build

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Create a temporary package.json without hardware wallet dependencies
RUN node -e "const pkg = require('./package.json'); \
    delete pkg.dependencies['@web3-onboard/ledger']; \
    delete pkg.dependencies['@web3-onboard/trezor']; \
    require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Use production web3 config
RUN cp src/lib/web3-config.production.ts src/lib/web3-config.ts

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create nginx user and set permissions
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx.pid /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]