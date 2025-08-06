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

# Production stage - Use nginx unprivileged image
FROM nginxinc/nginx-unprivileged:alpine

# Switch to root temporarily to install packages
USER root

# Install envsubst (it's part of gettext package)
RUN apk add --no-cache gettext

# Copy custom nginx config template
COPY --chown=nginx:nginx nginx.conf /etc/nginx/templates/nginx.conf.template

# Copy built application from build stage
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Create necessary directories for nginx with correct permissions
RUN mkdir -p /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

# Switch back to nginx user
USER nginx

# The container will listen on the PORT environment variable
# Default to 8080 if not set, but Cloud Run will override this
EXPOSE 8080

# Start nginx with environment variable substitution
CMD ["/bin/sh", "-c", "envsubst '$$PORT' < /etc/nginx/templates/nginx.conf.template > /tmp/nginx.conf && exec nginx -c /tmp/nginx.conf -g 'daemon off;'"]