# Use Node.js official image to build React app
FROM node:18 AS build

# Limit memory usage to prevent the build process from failing on low-resource systems
ENV NODE_OPTIONS=--max-old-space-size=512

# Set working directory
WORKDIR /app

# Install only production dependencies first to speed up subsequent layers
COPY package.json package-lock.json ./
RUN npm install --only=production

# Install dev dependencies and build the app
COPY . .
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object && npm run build

# Use Nginx to serve the React app
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built app from the previous build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port for the frontend
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

