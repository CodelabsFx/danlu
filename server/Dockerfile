FROM node:18-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --production

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY server ./server
ENV NODE_ENV=production
EXPOSE 3000
CMD [ "node", "server/src/index.js" ]
