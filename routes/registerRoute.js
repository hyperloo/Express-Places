const express = require("express"),
  router = express.Router();

const user = require("../models/user");

router.get("/", (req, res) => {
  res.render("register", { isSignedIn, userId });
});

router.post("/", (req, res) => {
  newUser = new user({ username: req.body.username, email: req.body.email });

  user.register(newUser, req.body.password, (err, user) => {
    if (err) {
      req.flash(
        "error",
        `Cannot br registered due to ${err} Register again!!!`
      );
      return res.redirect("/register");
    } else {
      req.login(user, err => {
        if (err) {
          req.flash("error", `Cannot proceed due to ${err}`);
          res.redirect("/register");
        } else {
          isSignedIn = req.isAuthenticated();
          userId = user._id;
          username = user.username;
          req.flash("success", `Successfully Registered! hello ${username}`);
          console.log(user);
          if (lastVisited !== null) {
            console.log("in ", lastVisited);
            return res.redirect(`/${lastVisited}`);
          } else {
            console.log("in campgrounds");
            return res.redirect("/campgrounds");
          }
        }
      });
    }
  });
});

module.exports = router;
