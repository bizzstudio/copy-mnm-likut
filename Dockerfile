# ============================================================================
#  mnm-likut — React 18 + Vite SPA → nginx
#  משתני VITE_* נצרבים בזמן ה-build (build args).
# ============================================================================

# ---------- שלב build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

ARG VITE_MAIN_SERVER_URL
ARG VITE_KIRSHNER_WHATSAPP_SERVER_URL
ARG VITE_KIRSHNER_WHATSAPP_API_KEY
ENV VITE_MAIN_SERVER_URL=$VITE_MAIN_SERVER_URL \
    VITE_KIRSHNER_WHATSAPP_SERVER_URL=$VITE_KIRSHNER_WHATSAPP_SERVER_URL \
    VITE_KIRSHNER_WHATSAPP_API_KEY=$VITE_KIRSHNER_WHATSAPP_API_KEY

RUN npm run build

# ---------- שלב serve ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
