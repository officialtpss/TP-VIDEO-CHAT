# Node TS Sample App
Ensures CRUD operations, APIs and Business Logic.

## Environment variables that should be defined before start
* `PORT` -> port on which to run APIs (should be same as exposed in container)
* `SERVER_URL` -> url used as host for API app
* `DB_HOST` -> database host
* `DB_DATABASE` -> database name
* `DB_USERNAME` -> database username
* `DB_PASSWORD` -> database password
* `NODE_ENV` -> production or development
* `JWT_SECRET` -> JSON web token secret
* `JWT_SECRET_ADMIN` -> JSON web token admin secret

## Database migration steps
* `cd /project-root;`
* `npx sequelize-cli db:migrate;`

## Commands for Backend to run node.js on local and on production
For developer mode use following commands
* `npm install`
* `npm start`

For Production mode run following commands
* `npm run build` → Generate Build ts to js
* `npm run start` → To start up application

To start up live background service with PM2
* Follow this Step Link →  https://pm2.keymetrics.io/
* Command → pm2 start build/app.js --name "node-ts-sample"
