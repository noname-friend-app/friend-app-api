# FROM ubuntu:latest
FROM node:latest
WORKDIR /app

# RUN apt update
# RUN apt install nodejs -y
# RUN apt install npm -y

COPY package.json ./
RUN npm install
COPY . ./

CMD ["npm", "run", "railway"]