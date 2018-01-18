const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes/index')
const pkg = require('./package')
const winston = require('winston')
const expressWinston = require('express-winston')

const app = express()

app.set('views', path.join(__dirname, 'views')) // 设置模板文件目录
app.set('view engine', 'ejs') // 设置模板引擎

app.use(express.static(path.join(__dirname, 'public'))) // 设置静态文件目录

// session 中间件
app.use(session({
  name: config.session.key, // 设置 cookie 中保存session id 的字段名称
  secret: config.session.secret, // 通过设置 secret 来计算 hash 值并放在cookie 中，使产生的 signedCookie 防篡改
  resave: true, // 强制更新session
  saveUninitialized: false, // 设置为false, 强制创建一个session, 即使用户未登录
  cookie: {
    maxAge: config.session.maxAge // 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({ // 将session 存储到mongodb
    url: config.mongodb // mongodb 地址
  })
}))

// flash 中间件， 用来显示通知
app.use(flash())

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'), // 上传文件目录
  keepExtensions: true
}))

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

// 添加模板必须的三个常量
app.use(function(req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}))

// 路由
routes(app)

// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))

// 处理错误
app.use(function(err, req, res, next) {
  console.error(err)
  req.flash('error', err.message)
  res.redirect('/posts')
})


if(module.parent){
  // 被 require, 则导出 app
  module.exports = app
} else {
  // 监听端口， 启动程序
  app.listen(config.port, function() {
    console.log(`${pkg.name} listening op port ${config.port}`)
  })
}