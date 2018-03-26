# specify the node base image with your desired version node:<version>
FROM node:latest

RUN git clone -b docker https://github.com/Hughp135/angular-5-chat-app.git

WORKDIR /angular-5-chat-app

RUN npm install

# replace this with your application's default port
EXPOSE 7202

CMD ["npm", "start"]
