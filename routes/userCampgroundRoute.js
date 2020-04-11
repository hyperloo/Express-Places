const express = require("express"),
  mongoose = require("mongoose"),
  router = express.Router();

const campground = require("../models/campground"),
  users = require("../models/user");

router.get("/", (req, res) => {
  var url = req.baseUrl.substring(1, req.baseUrl.length);
  users
    .findOne({ _id: mongoose.Types.ObjectId(url) })
    .populate("campgrounds")
    .exec((err, user) => {
      if (err) {
        req.flash(
          "error",
          `Campground of users cannot be fetched due to ${err}`
        );
        res.redirect("/campgrounds");
      } else {
        res.render("userCampgrounds", {
          base: true,
          campgrounds: user.campgrounds,
          user,
          isSignedIn,
          userId
        });
      }
    });
});

router.get("/campgrounds", (req, res) => {
  var url = req.baseUrl.substring(1, req.baseUrl.length);
  users
    .findOne({ _id: url })
    .populate("campgrounds")
    .exec((err, user) => {
      if (err) {
        req.flash(
          "error",
          `Campground of users cannot be fetched due to ${err}`
        );
        res.redirect("/campgrounds");
      } else {
        res.render("userCampgrounds", {
          base: false,
          campgrounds: user.campgrounds,
          user,
          isSignedIn,
          userId
        });
      }
    });
});

router.get("/new", (req, res) => {
  var url = req.baseUrl.substring(1, req.baseUrl.length);
  if (isSignedIn) {
    lastVisited = null;
    res.render("new_campground");
  } else {
    lastVisited = `url${req.Url.path}`;
    req.flash("error", "Please Login First to create new Campground");
    res.redirect("/login");
  }
});

router.put("/new", async (req, res) => {
  var url = req.baseUrl.substring(1, req.baseUrl.length);
  campground.create(
    {
      name: req.body.name,
      description: req.body.description,
      details: req.body.details,
      image: req.body.image,
      author: username,
      authorId: url
    },
    (err, newCampground) => {
      if (err) {
        req.flash("error", `Cannot Create new Campground due to ${err}`);
        res.redirect("/campgrounds");
      } else {
        users.findOne({ _id: mongoose.Types.ObjectId(url) }, (err, user) => {
          if (err) {
            req.flash("error", `Cannot Add to user List due to ${err}`);
            res.redirect("/campgrounds");
          } else {
            req.flash("success", "Successfully Created Campground");
            user.campgrounds.push(newCampground);
            user
              .save()
              .then(camp => {
                res.redirect(`/${url}`);
              })
              .catch(err => console.log(err));
          }
        });
      }
    }
  );
});
module.exports = router;
