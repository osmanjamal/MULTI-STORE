FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

WORKDIR /app/client

RUN npm install
RUN npm run build

WORKDIR /app

CMD ["npm", "start"]