var mongoose = require('mongoose');
var User = mongoose.model('User');

// signup
exports.showSignup = function(req, res) {
    res.render('signup', {
        title: '注册页面'
    })
}

exports.showSignin = function(req, res) {
    res.render('signin', {
        title: '登录页面'
    })
}

exports.signup = function(req, res) {
    var _user = req.body.user;

    User.findOne({ name: _user.name }, function(err, user) {
        if (err) {
            console.log(err);
        }

        if (user) {
            return res.redirect('/signin');
        } else {
            var user = new User(_user);
            user.save(function(err, user) {
                if (err) {
                    console.log(err);
                }

                console.log(user);
                res.redirect('/');
            })
        }
    });
    /*
        第一种取userid
        /user/signup/1111
        var userid=req.params.userid

        第二种取userid
        /user/signup/1111?userid=1112
        var userid=req.query.userid
        
        第三种
        var userid=req.body.userid;
     */
    //不论什么方式请求，用params方法
    // req.param('user')
}

// signin
exports.signin = function(req, res) {
    var _user = req.body.user;
    var name = _user.name;
    var password = _user.password;

    User.findOne({ name: name }, function(err, user) {
        if (err) {
            console.log(err);
        }

        if (!user) {
            return res.redirect('/signup');
        }

        user.comparePassword(password, function(err, isMatch) {
            if (err) {
                console.log(err);
            }

            if (isMatch) {
                console.log('Password is matched');

                req.session.user = user;
                return res.redirect('/');
            } else {
                console.log('Password is not matched');
                return res.redirect('/signup');
            }
        });
    });

}

// logout
exports.logout = function(req, res) {
    delete req.session.user;
    // delete app.locals.user;
    res.redirect('/');
}

// userlist page
exports.list = function(req, res) {
    var user = req.session.user;

    if(!user){
        return res.redirect('/signin');
    }

    if (user.role > 10) {
        User.fetch(function(err, users) {
            if (err) {
                console.log(err);
            }

            console.log(users);
            res.render('userlist', {
                title: 'imooc 用户列表页',
                users: users
            });
        });
    }
}

// midware for user
exports.signinRequired = function(req, res, next) {
    var user = req.session.user;

    if (!user) {
        return res.redirect('/signin');
    }

    next();
}

exports.adminRequired = function(req, res, next) {
    var user = req.session.user;

    console.log(user);
    if (user.role <= 10) {
        return res.redirect('/signin');
    }

    next();
}
