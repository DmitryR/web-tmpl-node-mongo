const mongoose = require('mongoose');
const dotenv = require('dotenv');
const defData = require('./controllers/defDataController.js');

// 1. handle uncaught exceptions
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
});

// 2. prepare connection str to mongo database
dotenv.config({ path: `${__dirname}/.env` });
const cbConnectionStr = process.env.DB_CONNECTION_URL.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);

// 3. read env param. it become with additional space at the end from command line
process.env.NODE_ENV = process.env.NODE_ENV.trim();
console.log(`process.env.NODE_ENV="${process.env.NODE_ENV}"`);

mongoose
  .connect(cbConnectionStr, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB Connection successful!');
  });

const app = require('./app');

const port = process.env.API_PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  // send notification message here email/slack

  server.close(() => {
    process.exit(1);
  });
});

defData.verifyAdminUser();
