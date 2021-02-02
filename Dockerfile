FROM node:14

RUN mkdir -p /usr/src/ang-fe
WORKDIR /usr/src/ang-fe
COPY . .

ENV NODE_ENV=production

RUN npm install rimraf -g && rimraf server/public/dist && npm install && npm run build:dockerenv

WORKDIR /usr/src/ang-fe/server
RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
