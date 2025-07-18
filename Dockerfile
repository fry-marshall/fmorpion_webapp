FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/fmorpion-webapp/browser/ /usr/share/nginx/html
EXPOSE 80