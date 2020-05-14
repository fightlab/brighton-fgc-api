FROM node:12-buster
WORKDIR /app
COPY package.json yarn.lock ./
