FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST_GRACE_MS=12000
ENV ALLOW_TEST_SEEDS=

EXPOSE 3000

CMD ["npm", "start"]
