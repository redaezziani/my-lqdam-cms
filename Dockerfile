# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build


# Production stage
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache dumb-init wget
COPY --from=builder /app ./

RUN mkdir -p .tmp public/uploads && \
    chmod -R 777 .tmp public/uploads

EXPOSE 1337
ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
