FROM node:18

COPY web /app
WORKDIR /app

# Install Node.js and npm
RUN apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set Node.js options to use the legacy OpenSSL provider
ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm install
RUN npm run build
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build"]
