# specify the node base image with your desired version node:<version>
FROM node:latest

RUN git clone -b docker https://github.com/Hughp135/angular-5-chat-app.git

COPY config/production.yml /angular-5-chat-app/config

WORKDIR /angular-5-chat-app

RUN npm install --production

# replace this with your application's default port
EXPOSE 7202

# Build front-end app
CMD ["npm", "run", "build"]

# Build and start back-end app
CMD ["npm", "run", "start:server"]
