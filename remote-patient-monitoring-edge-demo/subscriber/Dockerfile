FROM node:14-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 6000
CMD [ "node", "server.js" ]