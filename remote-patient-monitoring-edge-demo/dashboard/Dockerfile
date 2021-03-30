FROM node:14 as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
RUN npm install 

COPY . ./

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/ /etc/nginx/templates/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]