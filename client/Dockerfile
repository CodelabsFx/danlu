FROM node:18
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY client ./client
RUN npm run build --prefix client
EXPOSE 4173
CMD [ "npx", "serve", "-s", "client/dist", "-l", "4173" ]
