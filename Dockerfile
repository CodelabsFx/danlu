FROM node:18-alpine AS base
WORKDIR /app

# Install only production deps from root package.json
COPY package.json package-lock.json* ./
RUN npm ci --production --no-audit --no-fund

FROM node:18 AS client-build
WORKDIR /app
# copy client package manifest and install/build
COPY client/package.json client/package-lock.json* ./client/
COPY client ./client
RUN npm --prefix client install --no-audit --no-fund
RUN npm --prefix client run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY server ./server
# copy built client into server for static serving
COPY --from=client-build /app/client/dist ./server/client/dist
ENV NODE_ENV=production
EXPOSE 3000
CMD [ "node", "server/src/index.js" ]
