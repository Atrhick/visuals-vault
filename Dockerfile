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

# Production stage - Use nginx unprivileged image
FROM nginxinc/nginx-unprivileged:alpine

# Copy custom nginx config
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Cloud Run expects container to listen on $PORT
# We'll use a template to substitute the port at runtime
RUN sed -i 's/listen       8080/listen       ${PORT:-8080}/g' /etc/nginx/nginx.conf && \
    sed -i 's/listen  \[::\]:8080/listen  \[::\]:${PORT:-8080}/g' /etc/nginx/nginx.conf

# Expose port 8080 (Cloud Run will override with PORT env)
EXPOSE 8080

# nginx-unprivileged already runs as nginx user
# Start nginx
CMD ["sh", "-c", "envsubst '$$PORT' < /etc/nginx/nginx.conf > /tmp/nginx.conf && nginx -c /tmp/nginx.conf -g 'daemon off;'"]