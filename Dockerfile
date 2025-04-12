FROM node:18-alpine

#Install the tools needed to build bcryptjs
RUN apk add --no-cache python3 make g++

WORKDIR /

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/app.js"]