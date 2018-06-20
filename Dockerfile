FROM node:9

# ADD https://api.github.com/repos/hughp135/angular-5-chat-app/git/refs/heads/docker version.json

# RUN git clone -b docker https://github.com/Hughp135/angular-5-chat-app.git

# COPY config/production.yml /angular-5-chat-app/config

RUN mkdir chat-app
WORKDIR /chat-app

COPY back-end back-end
COPY src src
COPY config config
COPY vendor vendor
COPY themes themes
COPY e2e e2e
COPY package.json package-lock.json tsconfig.json tslint.json .angular-cli.json ./
COPY shared-interfaces shared-interfaces

RUN npm install --production

# Build the angular app
RUN npm run build

# Expose API port
EXPOSE 7205
EXPOSE 7443

# Compile and start back-end app
CMD ["npm", "run", "start:server"]
