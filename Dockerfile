# ── Stage 1: build ──
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .

RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/seed --esModuleInterop --resolveJsonModule --skipLibCheck

# ── Stage 2: production ──
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 4001

CMD ["sh", "-c", "npx prisma migrate deploy && (node dist/seed/prisma/seed.js || echo 'Seed skipped') && node dist/main.js"]
