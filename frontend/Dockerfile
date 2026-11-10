# Multi-stage: Webpack Module Federation build → nginx (shell + remotes, same-origin).
# Build context: frontend/
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages
COPY turbo.json ./

RUN npm ci

# Same-origin API bases proxied by nginx (/api/<svc>/ → Spring controllers).
ENV ORDERS_API_BASE_URL=/api/orders \
    PAYMENT_API_BASE_URL=/api/payment \
    INVENTORY_API_BASE_URL=/api/inventory \
    NOTIFICATION_API_BASE_URL=/api/notification \
    MF_SAME_ORIGIN=true

# Build remotes first (publicPath under /mf/<name>/), then the host shell.
RUN MF_PUBLIC_PATH=/mf/orders/ npm run build -w @poc/orders \
 && MF_PUBLIC_PATH=/mf/payment/ npm run build -w @poc/payment \
 && MF_PUBLIC_PATH=/mf/inventory/ npm run build -w @poc/inventory \
 && MF_PUBLIC_PATH=/ npm run build -w @poc/shell

FROM nginx:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/packages/shell/dist/ /usr/share/nginx/html/
COPY --from=build /app/packages/orders/dist/ /usr/share/nginx/html/mf/orders/
COPY --from=build /app/packages/payment/dist/ /usr/share/nginx/html/mf/payment/
COPY --from=build /app/packages/inventory/dist/ /usr/share/nginx/html/mf/inventory/

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
