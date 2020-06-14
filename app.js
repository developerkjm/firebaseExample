var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false })); 에러가 떠서 true로 변경함.
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


/* 추가1.routes 폴더에 있는 board1.js 파일을 board1 이라는 가상 폴더(/)로 사용하겠다는 것이다.*/
// Raltime DB 용으로 사용하는 것. 
// app.use('/board1', require('./routes/board1'));

//Cloud Firestore 실제사용할 때는 하나의 데이터베이스만 선언해서 사용하도록 해야한다.
// app.use('/board2' ,require('./routes/board2'));

//firebase 로그인을 해보자
app.use('/board3', require('./routes/board3'));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
