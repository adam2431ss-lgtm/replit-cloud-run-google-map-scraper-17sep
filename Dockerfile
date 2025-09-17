# Use Node.js 20 LTS as the base image for long-term support
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the server code
COPY server/ ./

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose the port (Cloud Run will override this)
EXPOSE 3001

# Set environment variables for production
ENV NODE_ENV=production

# Start the server
CMD ["node", "index.js"]