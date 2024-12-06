# Base image with Node.js
FROM node:18 AS base

# Limit memory usage
ENV NODE_OPTIONS=--max-old-space-size=512

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./

# Install production dependencies if NODE_ENV is production
RUN if [ "$NODE_ENV" = "production" ]; then npm install --production; else npm install; fi

# Add the rest of the source code
COPY . .

# Use a build-time argument to differentiate between environments
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# For production, build the app
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

# -----------------------------
# Production Stage
# -----------------------------
FROM nginx:alpine AS production

# Copy Nginx configuration (ensure this file exists in your project)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built app from the base stage
COPY --from=base /app/build /usr/share/nginx/html

# Expose port for web traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# -----------------------------
# Development Stage
# -----------------------------
FROM base AS development

# Explicitly set NODE_ENV to development in the development stage
ENV NODE_ENV=development

# Expose port for development server
EXPOSE 3000

# Start the app in development mode (starts webpack dev server)
CMD ["npm", "start"]
