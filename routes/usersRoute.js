const express = require("express"),
  router = express.Router();

const user = require("../models/user");

router.get("/", (req, res) => {
  user.find({}, (err, users) => {
    if (err) {
      req.flash("error", `Cannot fetch users because of ${err}`);
      res.redirect("/campgrounds");
    } else {
      res.render("users", { isSignedIn, userId, users });
    }
  });
});

module.exports = router;
