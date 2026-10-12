FROM node:22-bookworm-slim AS development
WORKDIR /app

# Linux hosts the JS servers only. Electron and native builds run on the host.
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
COPY package.json yarn.lock ./
COPY patches ./patches
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .
EXPOSE 8081 8083
CMD ["yarn", "web"]
