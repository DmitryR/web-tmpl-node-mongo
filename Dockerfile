# Docker multi-stage script for template app Node, Mongo, Express
# Written by Dmytro Romanenko dmitrypub@gmail.com 2020

# base 
FROM node:slim as base
EXPOSE 3000
USER root
WORKDIR /var/src/app
COPY ./app/package*.json ./
RUN npm config list
RUN npm cache clean --force
ENV PATH /var/src/app/node_modules/.bin:$PATH

# development
# docker build --target dev -t drtemplate:dev  .
FROM base as dev
ENV NODE_ENV=development
RUN npm ci && npm install --only-development && npm cache clean --force
USER node
CMD ["npm", "run", "dev"]

# production
# docker build --target prod -t drtemplate:prod  .
FROM base as prod
ENV NODE_ENV=production
HEALTHCHECK CMD curl http://127.0.0.1/ || exit 1
COPY ./app ./
RUN npm config list
RUN npm install --only-production && npm cache clean --force
USER node
CMD ["npm", "run", "prod"]

# test
# docker build --target test -t drtemplate:test  .
FROM dev as test
WORKDIR /var/src
COPY ./test ./
WORKDIR /var/src/app
RUN npm audit --audit-level=critical
WORKDIR /var/src/test
USER root
CMD ["npm", "run", "test"]