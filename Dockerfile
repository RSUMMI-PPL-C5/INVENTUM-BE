FROM node:22

COPY . /app

WORKDIR /app

RUN npm install --legacy-peer-deps

EXPOSE 8000

CMD ["npm", "start"]