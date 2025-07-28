FROM node:22
RUN apt-get update && apt-get install -y python3 make build-essential libvips-dev

WORKDIR /app
COPY . .

RUN npm install
EXPOSE 3000

CMD ["npm", "run","start"]
