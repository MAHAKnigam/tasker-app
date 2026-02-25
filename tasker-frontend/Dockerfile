# Development stage
FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck and dumb-init to handle signals properly
RUN apk add --no-cache dumb-init curl

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Install ajv explicitly to fix the module issue
RUN npm install ajv@^8.12.0

# Copy source code
COPY src ./src
COPY public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV REACT_APP_API_URL=http://backend:5000 \
    NODE_ENV=development \
    NODE_OPTIONS=--max-old-space-size=2048

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start application in development mode
CMD ["npm", "start"]
