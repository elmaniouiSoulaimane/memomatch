FROM node:14 AS build

WORKDIR /app

COPY . /app

RUN npm install && NODE_ENV=production npm run build

FROM nginx:stable-alpine

# Copy the build output to Nginx's default HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the default Nginx HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]