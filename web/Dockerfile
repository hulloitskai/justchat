# Builder:
FROM node:14-alpine3.13 AS builder

# Configure args
ARG SENTRY_URL=https://sentry.io/
ARG SENTRY_ORG=
ARG SENTRY_PROJECT=
ARG SENTRY_AUTH_TOKEN

# Install dependencies
WORKDIR /workspace/web
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build web
COPY ./ ./
RUN yarn build
RUN mkdir -p /dist && cd .. && mv web/ /dist/


# Runner:
FROM node:14-alpine3.13 AS runner

# Install system dependencies
RUN apk add --update --no-cache curl

WORKDIR /app
COPY --from=builder /dist/web/next.config.js ./
COPY --from=builder /dist/web/public ./public
COPY --from=builder /dist/web/.next/ .next/
COPY --from=builder /dist/web/node_modules/ node_modules/
COPY --from=builder /dist/web/package.json package.json

# Configure permissions
RUN addgroup -g 1001 -S docker && \
    adduser -u 1001 -S docker && \
    chown -R docker:docker /app/.next
USER docker

# Configure env
ENV NODE_ENV=production
ENV JUSTCHAT_WEB_HOST=0.0.0.0
ENV JUSTCHAT_WEB_PORT=8000

# Run web
EXPOSE $JUSTCHAT_WEB_PORT
ENTRYPOINT ["yarn"]
CMD ["start"]
HEALTHCHECK CMD curl --fail --head http://localhost:$JUSTCHAT_WEB_PORT
