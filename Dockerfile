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

# Use production web3 config if it exists
RUN if [ -f src/lib/web3-config.production.ts ]; then \
    cp src/lib/web3-config.production.ts src/lib/web3-config.ts; \
    fi

# Build the application
RUN npm run build

# Production stage - Use standard nginx alpine
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create a simple nginx config that listens on port 80
RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "OK"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Remove the default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.template

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]