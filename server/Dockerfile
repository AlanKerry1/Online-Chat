# Stage 1: build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Копируем билд, prisma schema и миграции
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
