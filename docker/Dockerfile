# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY tsconfig*.json nest-cli.json ./
COPY src ./src/
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma/

COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

USER nestjs

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
