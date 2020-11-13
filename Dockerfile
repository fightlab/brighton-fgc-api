FROM node:12 AS base
WORKDIR /app
COPY package.json yarn.lock ./

FROM base AS build
RUN yarn --audit
ADD . .
RUN yarn build

FROM node:12-alpine
WORKDIR /app
COPY --from=build /app .
ENV NODE_ENV production
ENV PORT=80
EXPOSE 80
CMD ["yarn", "start"]
