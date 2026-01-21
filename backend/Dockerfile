# Acropaq Store - Medusa.js Backend
# Multi-stage build for production

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Create non-root user for security
RUN addgroup -g 1001 -S medusa && \
    adduser -S medusa -u 1001 -G medusa

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/medusa-config.js ./
COPY --from=builder /app/data ./data

# Create uploads directory
RUN mkdir -p uploads && chown -R medusa:medusa /app

# Switch to non-root user
USER medusa

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:9000/health || exit 1

# Start the application
CMD ["npm", "run", "start"]
