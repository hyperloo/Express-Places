const express = require("express"),
  expressSession = require("express-session"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  localStrategy = require("passport-local").Strategy,
  flash = require("express-flash"),
  methodOverride = require("method-override"),
  sanitizer = require("express-sanitizer");

const campgrounds = require("./routes/campgroundRoute.js"),
  register = require("./routes/registerRoute"),
  logout = require("./routes/logoutRoute"),
  login = require("./routes/loginRoute"),
  users = require("./routes/usersRoute"),
  userCampgrounds = require("./routes/userCampgroundRoute"),
  _ = require("lodash");

const user = require("./models/user"),
  campground = require("./models/campground"),
  comments = require("./models/comment");

const app = express();

function ignoreFavicon(req, res, next) {
  if (req.originalUrl === "/favicon.ico") {
    res.status(204).json({ nope: true });
  } else {
    next();
  }
}

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(sanitizer());
app.use(ignoreFavicon);

app.use(express.static(__dirname + "/public"));

app.use(
  expressSession({
    secret: "WX$-?/?%@W/lk!h)(i~",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(
  "local-new",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, //for callback function done which is for the error handling
    },
    (req, email, password, done) => {
      // console.log("email", email);
      user.findOne({ email: email }, (err, userWithEmail) => {
        // console.log(userWithEmail);
        if (err) {
          // console.log("upper err");
          return done(null, false, { error: err });
        }
        if (!userWithEmail) {
          // console.log("!userWithEmail");
          return done(null, false, {
            error: "No user with this email! Login Again",
          });
        }
        if (userWithEmail) {
          // console.log("userWithEmail", userWithEmail.salt);
          // console.log("userWithEmail.username", userWithEmail.username);
          //console.log("username", req.body.username);
          /*if (
            !(
              userWithEmail.username.toString() === req.body.username.toString()
            )
          ) {
            console.log("!userWithEmail.username");
            return done(null, false, {
              error: "Invalid username. Login again with correct username"
            });
          }*/

          if (!userWithEmail.validPassword(password)) {
            // console.log("password");
            return done(null, false, {
              error: "Invalid password. Login Again with correct password",
            });
          }
          // console.log("valid", user);
          return done(null, user);
        }
      });
    }
    /*,
    (username, password, done) => {
      user.findOne({ username: username }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "No user with this username" });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Incorrect Password" });
        }
        return done(null, user, {
          message: `Hello ${user.username} Login Successful!!!`
        });
      });
    }*/
  )
);

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

mongoose
  .connect(
    "mongodb+srv://HimanshuSingh:Idea0362@cluster0-jwfcs.mongodb.net/test?retryWrites=true&w=majority&connectTimeoutMS=3000",
    { useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.log("server not started due to ", err));

userId = null;
isSignedIn = false;
username = null;
latestComment = null;
lastVisited = null;
liked = 0;

app.locals.moment = require("moment");

app.get("/", (req, res) => {
  // console.log(isSignedIn);
  // console.log(app.locals.moment(Date.now()).fromNow());
  res.render("index", { isSignedIn, userId });
});

app.get("/favicon.ico", (req, res) => res.status(204));

app.use("/campgrounds", campgrounds);

app.use("/register", register);

app.use("/logout", logout);

app.use("/login", login);

app.use("/users", users);

app.get("/new", (req, res) => {
  if (isSignedIn) {
    res.redirect(`/${userId}/new`);
  } else {
    req.flash("error", "Please Sign In First!");
    res.redirect("/login");
  }
});
app.use("/:userId", userCampgrounds);

app.listen(3000, () => console.log("Server started"));
