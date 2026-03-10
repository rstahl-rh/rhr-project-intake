# Multi-stage build for MOC Intake Form Application

# Stage 1: Build dependencies
FROM node:20-alpine AS dependencies

WORKDIR /build

# Copy package files
COPY webpage/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Stage 2: Final runtime image
FROM node:20-alpine

# Install bash for entrypoint script
RUN apk add --no-cache bash

# Create app directory
WORKDIR /app

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Copy application files
COPY webpage/*.js /app/
COPY webpage/*.html /app/
COPY webpage/*.css /app/
COPY webpage/package*.json /app/

# Copy production dependencies from build stage
COPY --from=dependencies /build/node_modules /app/node_modules

# Copy entrypoint script
COPY entrypoint.bash /app/entrypoint.bash
RUN chmod +x /app/entrypoint.bash

# Expose application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app /app/data

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the application via entrypoint script
ENTRYPOINT ["/app/entrypoint.bash"]
