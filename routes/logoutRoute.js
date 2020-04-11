const express = require("express"),
  router = express.Router();

router.get("/", (req, res) => {
  req.logOut();
  isSignedIn = req.isAuthenticated();
  userId = null;
  username = null;
  req.flash("success", "Logout Successful!");
  res.redirect("/campgrounds");
});

module.exports = router;
