var createError = require('http-errors');
// var url = '/www/server/nvm/versions/node/v12.18.0/lib/node_modules/'
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(logger('dev'));

// 跨域
app.use(cors({
  origin:['http://localhost:8080'], 
  credentials: true
}))

// 改写
var http = require('http');
var server = http.createServer(app);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// session 生成
app.use(session({
  secret:'secret', //密钥
  cookie: {maxAge:60*1000*120}, //过期时间两小时
  resave:true,
  saveUninitialized:true
}))

// 静态资源目录
app.use('/public',express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

server.listen('3000')
