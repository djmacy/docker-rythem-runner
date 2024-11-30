# Use Node.js official image to build React app
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the app's source code
COPY . ./

# Build the React app
RUN npm run build

# Use Nginx to serve the React app
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built app from the previous build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port for the frontend
EXPOSE 80
