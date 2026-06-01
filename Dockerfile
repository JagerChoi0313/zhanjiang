# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache su-exec
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY deploy/app-entrypoint.sh /usr/local/bin/app-entrypoint.sh

RUN chmod +x /usr/local/bin/app-entrypoint.sh \
  && mkdir -p /app/public/upload \
  && chown -R nextjs:nodejs /app/public/upload

EXPOSE 3000
ENTRYPOINT ["app-entrypoint.sh"]
CMD ["node", "server.js"]

FROM deps AS tooling
COPY . .
COPY deploy/app-entrypoint.sh /usr/local/bin/app-entrypoint.sh
RUN chmod +x /usr/local/bin/app-entrypoint.sh
ENTRYPOINT ["app-entrypoint.sh"]
CMD ["pnpm", "db:migrate"]
