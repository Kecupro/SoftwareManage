# Build frontend
FROM node:18 AS build-frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Build backend
FROM node:18 AS build-backend
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ .
# Copy frontend build vào backend
COPY --from=build-frontend /app/client/dist ./client/dist

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]