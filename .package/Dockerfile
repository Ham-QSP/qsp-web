# syntax=docker/dockerfile:1.7

# Builder: installs dependencies (including the @ham-qsp scoped package from
# the GitHub npm registry) and produces the static production bundle.
# The NODE_AUTH_TOKEN is passed as a BuildKit secret, so it never lands in an
# image layer or in the build cache metadata.
FROM node:22.17-bookworm-slim AS builder
WORKDIR /build

COPY package.json yarn.lock .npmrc ./
RUN corepack enable
RUN --mount=type=secret,id=node_auth \
    NODE_AUTH_TOKEN="$(cat /run/secrets/node_auth 2>/dev/null || true)" \
    yarn install --frozen-lockfile --non-interactive

COPY . .
# Do NOT run `yarn type-check` here: this image packages the already-verified
# production bundle, and type-checking is a CI/lint-time concern, not a
# build-time one for the runtime image.
RUN yarn build-only

# Runtime: a minimal nginx image serving the static bundle.
#
# The Alpine base tag (nginx:1.29-alpine-slim) lags its own apk repository by
# a few patch releases at any given time, which leaves fixable high/critical
# CVEs in libssl3/libcrypto3/pcre2 etc. that fail the Grype gate in CI (see
# .github/workflows/release.yml). `apk upgrade` below pulls the latest patched
# package versions from the same Alpine release at build time, the same way
# the qsp-authentication Dockerfile removes `pebble` to pass its own scan --
# both are "make the final filesystem match what the scanner expects" fixes,
# not image-size changes. Re-run this if a future scan still finds a gap.
FROM nginx:1.29-alpine-slim AS runtime
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

COPY --from=builder /build/dist /usr/share/nginx/html
# Default/fallback config.json: baked in so the image runs standalone, but
# meant to be overridden by a bind mount (or a derived image layer) at
# deploy time. See .package/config.json for the documented default.
COPY .package/config.json /usr/share/nginx/html/config.json
COPY .package/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
