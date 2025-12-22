# ===============================
# Build stage
# ===============================
FROM node:22-alpine AS builder

WORKDIR /opt/app

# System deps needed by Strapi
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL deps (Strapi needs devDeps to build admin)
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build Strapi admin
ENV NODE_ENV=production
RUN npm run build


# ===============================
# Production stage
# ===============================
FROM node:22-alpine

WORKDIR /opt/app

# Runtime deps
RUN apk add --no-cache dumb-init wget

# Copy only required files from builder
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/package*.json ./
COPY --from=builder /opt/app/config ./config
COPY --from=builder /opt/app/database ./database
COPY --from=builder /opt/app/src ./src

# Create runtime dirs
RUN mkdir -p .tmp public/uploads && \
    chown -R node:node /opt/app

USER node

EXPOSE 1337
ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./node_modules/@strapi/strapi/bin/strapi.js", "start"]
