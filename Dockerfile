FROM node:12
WORKDIR /app
COPY package.json yarn.lock ./
