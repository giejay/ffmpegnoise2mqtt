FROM node:current-alpine3.17

RUN mkdir /app 

RUN apk add ffmpeg

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY silence-detector.js silence-detector.js
RUN npm install

CMD node /app/silence-detector.js
