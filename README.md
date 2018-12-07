[![Build Status](https://travis-ci.org/Hughp135/angular-5-chat-app.svg?branch=master)](https://travis-ci.org/Hughp135/angular-5-chat-app) [![Coverage Status](https://coveralls.io/repos/github/Hughp135/angular-5-chat-app/badge.svg?branch=master)](https://coveralls.io/github/Hughp135/angular-5-chat-app?branch=master)

## Setting up local project

Make sure you have a MongoDB server running locally on port 2017 (or change the mongodb.url in config/default.yml).

Type the following commands:

`npm install`

`npm run db:seed` optional: generates sample data (servers + users + channels)

`npm start` (starts the front-end app)

`npm start:server:dev` (Must be running alongside the frontend)

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

Run `docker build -t imagename .` to build docker image (production only)

## Running unit tests

Run `npm test` to execute the unit tests (front & back-end)

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Project To-Do list

Trello board at [https://trello.com/b/b5DeyaVi/chat-app](https://trello.com/b/b5DeyaVi/chat-app)

## Deploying

Run `docker-compose pull` to pull latest image (currently image is private)
Run `docker-compose up` to launch the app in production (only I can do this)
