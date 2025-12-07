# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy package files
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies (generate lockfile in CI)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY src ./src

# Build the application
RUN pnpm run build

# Build seed scripts
RUN pnpm exec tsc src/scripts/seed-slot.ts --outDir dist/scripts --module commonjs --target es2020 --esModuleInterop --resolveJsonModule --moduleResolution node

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install SQL Server tools and wget for healthcheck
RUN apk add --no-cache curl wget gnupg \
    && curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/msodbcsql18_18.3.1.1-1_amd64.apk \
    && curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/mssql-tools18_18.3.1.1-1_amd64.apk \
    && apk add --allow-untrusted msodbcsql18_18.3.1.1-1_amd64.apk \
    && apk add --allow-untrusted mssql-tools18_18.3.1.1-1_amd64.apk \
    && rm -f msodbcsql18_18.3.1.1-1_amd64.apk mssql-tools18_18.3.1.1-1_amd64.apk

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy package files
COPY package.json ./

# Install production dependencies
RUN pnpm install --no-frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy wait-for-db script
COPY wait-for-db.sh /app/wait-for-db.sh
RUN chmod +x /app/wait-for-db.sh

# Expose port 4002 for Express server
EXPOSE 4002

# Start the application with wait-for-db
CMD ["/bin/sh", "-c", "/app/wait-for-db.sh && pnpm run start"]
