const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    session = require('express-session'),
    User = require('./models/user'),
    flash = require('connect-flash'),
    app = express();

mongoose.connect("mongodb://localhost:27017/practice_auth_app", { useNewUrlParser: true })
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log(err))

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ 'secret': 'secret', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.message = req.flash('success');
    next();
});


passport.use('signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, { message: "Username already exists" })
        }
        var user = new User();
        user.username = username;
        user.password = user.encryptPassword(password);
        user.save(function (err, user) {
            if (err) {
                return done(err);
            }
            return done(null, user, {message: req.flash('success', 'Registered Successfully!')});
        })
    });
}));

passport.use('login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false)
        }
        if (!user.comparePassword(password)) {
            return done(null, false)
        }
        return done(null, user, {message: req.flash('success', 'Signed you in!')});
    });
}));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/user/register", (req, res) => {
    res.render("register");
})

app.post("/user/register", passport.authenticate("signup", {
    successRedirect: "/",
    failureRedirect: "/user/register",
    failureFlash: true
}));

app.get("/user/login", (req, res) => {
    res.render("login");
});

app.post("/user/login", passport.authenticate('login', {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true
}));

app.get("/logout", (req, res) => {
    req.logout();
    res.status(301).redirect("/user/login");
})

app.listen(3000, () => {
    console.log("Server has started on port 3000");
});