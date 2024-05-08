FROM node:16-alpine as builder
WORKDIR /builder
COPY --from=installer /installer/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:16-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /installer
COPY package.json ./
RUN pnpm install --frozen-lockfile

# option 1 for production
FROM node:16-alpine as production
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /builder/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /builder/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]


# option 2 for production
# FROM node:16-alpine as production
# WORKDIR /app
# ENV NODE_ENV=production
# COPY --from=builder /builder/public ./public
# COPY --from=builder /builder/.next ./.next
# COPY --from=builder /builder/package.json /builder/yarn.lock ./
# RUN yarn install next
# EXPOSE 3000
# CMD ["yarn", "start"]

