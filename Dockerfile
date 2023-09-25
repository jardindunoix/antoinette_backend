FROM node:19-alpine3.16
WORKDIR /app
COPY . .
RUN npm install

ENTRYPOINT ["node", "src/back.js"]


