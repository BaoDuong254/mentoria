# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

# Copy package files
COPY package.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Install dependencies (generate lockfile in CI)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY public ./public
COPY src ./src
COPY scripts ./scripts
COPY index.html ./

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose ports
EXPOSE 80 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
