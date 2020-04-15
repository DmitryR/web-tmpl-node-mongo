const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('views', path.join(__dirname, 'views'));

// 1. sequrity http headers
app.use(helmet());

// 2. Add morgan logger to dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. limit requests from same API to 100
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this IP, please try again in an on hour!'
});
app.use('/api', limiter);

// 4. body parser size limit, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 5. data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 6. data sanitization against XSS
app.use(xssClean());

// 7. prevent parameter polution
app.use(
  hpp({
    whitelist: ['price']
  })
);

// 8. test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);

  next();
});

// 9.  routs
app.get('/', (req, res) => {
  res.status(200).render('base', {
    user: 'admin'
  });
});

app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
