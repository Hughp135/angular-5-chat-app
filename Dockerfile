FROM node:9

ADD https://api.github.com/repos/hughp135/angular-5-chat-app/git/refs/heads/docker version.json

RUN git clone -b docker https://github.com/Hughp135/angular-5-chat-app.git

COPY config/production.yml /angular-5-chat-app/config

WORKDIR /angular-5-chat-app

RUN npm install --production

# replace this with your application's default port
EXPOSE 7205

# Build front-end app
RUN npm run build

# Build and start back-end app
CMD ["npm", "run", "start:server"]
