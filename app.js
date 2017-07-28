
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var multipart = require('connect-multiparty');
var morgan = require('morgan');
var path = require('path');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);
var port = process.env.PORT || 3000;
var app = express();
var fs = require('fs');
var serveStatic = require('serve-static');
var dbUrl = 'mongodb://localhost/imooc';

mongoose.connect(dbUrl);

//models loading
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs
        .readdirSync(path)
        .forEach(function(file) {
            var newPath = path + '/' + file;
            var stat = fs.statSync(newPath);

            if (stat.isFile()) {
                if (/(.*)\.(js|coffee)/.test(file)) {
                    require(newPath);
                }
            } else if (stat.isDirectory) {
                walk(newPath)
            }
        })
}
walk(models_path);

app.set('views', './app/views/pages');
app.set('view engine', 'jade');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); //不使用签名
app.use(multipart());
//若需要使用签名，需要指定一个secret,字符串,否者会报错
// app.use(cookieParser('Simon'));
app.use(session({
    secret: 'imooc',
    store: new mongoStore({
        url: dbUrl,
        collection: 'sessions'
    })
}));


var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    app.set('showStackError', true);
    app.use(morgan(':method :url :status'));
    app.locals.pretty = true;
    mongoose.set('debug', true);
}

require('./config/routes')(app);

app.listen(port);
app.locals.moment = require('moment');
app.use(serveStatic(path.join(__dirname, 'public')));

console.log('meMovie started on port ' + port);

/*关于express3与express4对应模块
查看 https://github.com/expressjs/express/wiki/Migrating-from-3.x-to-4.x
*/

/*
var mongoose = require('mongoose'),
    dbUrl ='mongodb://@localhost:27017/mongodbtest',
    session = require('express-session'),
    connect = require('connect'),
    MongoStore = require('connect-mongo')(session),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'); 
app.use(session({
     store: new MongoStore({ 
      url: dbUrl,
      ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    })

到这里基本设置就完成了，接下来我们要做的是
1、在登录的时候将session存入数据库；
2、根据session进行页面拦截。

登录存入session:
当登录的用户名和密码进行验证之后，执行如下代码：
req.session.user = {
     'username':User.username,
     'chatNumber':User.chatNumber,
     'userimg':User.userimg
   }//User为存入数据库回调回来的用户对象
此时数据库中会有sessions的集合，我们也可在全局取得req.session.user,
这样每进入一个需要user对象信息的页面时就可以通过session将用户信息传入页面。

session拦截:
在app.js中插入如下代码：

/session 拦截器
app.use(function (req, res, next) {          
    var url = req.originalUrl;//获取url
    if(!req.session.user&&url != "/login"&&url != "/register"&&url != "/postLogin"){
        return res.redirect("/login");
    }
    next();
});

以上除了注册登录页面，其余页面在未登录情况下将都被拦截，postLogin为登录过程中提交的地址，不能被拦截，
否则cookie将不会被存入。
 */
