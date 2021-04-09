FROM node:14-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install typescript -g
RUN npm install dotenv -g

RUN npm ci --only=production

COPY . .

CMD [ "npm", "run", "start:prod" ]