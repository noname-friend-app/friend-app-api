FROM node:15
WORKDIR /app
COPY package.json ./
run npm install
COPY . .
run npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]