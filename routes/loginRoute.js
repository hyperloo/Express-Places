const express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  mongoose = require("mongoose"),
  localStrategy = require("passport-local").Strategy;

const user = require("../models/user");

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
passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    user.authenticate()
  )
);
router.get("/", (req, res) => {
  res.render("login", { isSignedIn, userId });
});

/*router.post("/", passport.authenticate("local-new"), (err, req, res) => {
  if (req.user) {
    isSignedIn = req.isAuthenticated();
    userId = req.user._id;
    username = req.user.username;
    req.flash("error", `Hello ${req.user.username}! Successful Login`);
    if (lastVisited !== null) {
      console.log("in ", lastVisited);
      res.redirect(`/${lastVisited}`);
    } else {
      console.log("in campgrounds");
      res.redirect("/campgrounds");
    }
  } else {
    req.flash("error", `Cannot Login due to ${err}`);
    res.redirect("/login");
  }
});*/

router.post(
  "/",
  passport.authenticate("local", {
    failureFlash: "Wrong UserId or Password",
    failureRedirect: "/campgrounds"
  }),
  (req, res) => {
    if (req.user) {
      //success of authentication will automatically add object like .user, .user.info, .isAuthenticated(), isNotAuthenticated() to the 'req'
      //console.log("login successful", req.user, req.isAuthenticated());,
      isSignedIn = req.isAuthenticated();
      userId = req.user._id;
      username = req.user.username;
      //console.log(isSignedIn, userId, username, lastVisited, req.user);
      req.flash("success", `Login Successful! Hello ${username} `);
      user.findOne({ _id: req.user._id }, (err, user) => {
        if (err) {
          req.flash("error", "cannot update during login");
          res.redirect("back");
        } else {
          user.lastLogin = Date.now();
          user
            .save()
            .then(user => {
              /*console.log(user)*/
            })
            .catch(err => console.log(err));
        }
      });
      lastVisited
        ? res.redirect(`/${lastVisited}`)
        : res.redirect(`/campgrounds`);
    } else {
      //console.log(isSignedIn, userId, username);
      req.flash("error", "Wrong Id or Password");
      res.redirect("/");
    }
  }
);

module.exports = router;
