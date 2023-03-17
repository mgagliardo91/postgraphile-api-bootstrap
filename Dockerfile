FROM node:18-alpine AS base
WORKDIR /app

### Builder ###
FROM base AS builder
RUN apk --no-cache add build-base python3
COPY package.json package-lock.json ./
RUN npm install --omit=dev \
    && cp -R node_modules /tmp/node_modules \
    && npm install
COPY . .
RUN npm run build

### Runner ###
FROM base AS runner
COPY --from=builder --chown=node:node /tmp/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json .
COPY --from=builder --chown=node:node /app/.gmrc.js .

USER node
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
