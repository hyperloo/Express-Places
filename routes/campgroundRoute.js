const express = require("express"),
  mongoose = require("mongoose"),
  Pusher = require("pusher"),
  _ = require("lodash"),
  router = express.Router();

const campgrounds = require("../models/campground"),
  users = require("../models/user"),
  comments = require("../models/comment");

var pusher = new Pusher({
  appId: "942673",
  key: "8a024133a1caa7c0c661",
  secret: "7a951d493d4e763b52aa",
  cluster: "ap2",
  useTLS: true
});

router.get("/", (req, res) => {
  //console.log(isSignedIn, userId);
  campgrounds.find({}, (err, campgrounds) => {
    if (err) {
      req.flash("error", `Cannot fetch records due to ${err}`);
      res.redirect("/");
    } else {
      res.render("campgrounds", { campgrounds, isSignedIn, userId });
    }
  });
});

router.put("/:camp_id/new_comment", (req, res) => {
  if (!isSignedIn) {
    //console.log("before", lastVisited);
    lastVisited = `campgrounds/${req.params.camp_id}`;
    //console.log("after", lastVisited);
    req.flash("error", "Login First to make a comment!");
    res.redirect("/login");
  } else {
    lastVisited = null;
    comments.create(
      {
        text: req.body.comment,
        author: username
      },
      (err, newComment) => {
        if (err) {
          console.log("no new comment ", err);
          req.flash("error", `Cannot make a comment due to ${err}`);
          res.redirect(`/campgrounds/${req.params.camp_id}`);
        } else {
          latestComment = newComment;
          console.log(newComment);
          campgrounds.findOne(
            { _id: mongoose.Types.ObjectId(req.params.camp_id) },
            (err, campground) => {
              if (err) {
                console.log("no addition to campgrounds", err);
                req.flash("error", `Cannot make a comment due to ${err}`);
                res.redirect(`/campgrounds/${req.params.camp_id}`);
              } else {
                console.log(newComment, campground);
                campground.comments.push(newComment);
                campground
                  .save()
                  .then(campground => {
                    console.log("inside ", campground);
                    res.redirect(`/campgrounds/${req.params.camp_id}`);
                  })
                  .catch(err => console.log(err));
              }
            }
          );
        }
      }
    );
  }
});

router.get("/:camp_id/edit", (req, res) => {
  if (!isSignedIn) {
    req.flash("error", "Login First");
    res.redirect("/login");
  } else {
    campgrounds.findOne(
      { _id: mongoose.Types.ObjectId(req.params.camp_id) },
      (err, camp) => {
        console.log(userId, typeof userId.toString());
        if (userId.toString() === camp.authorId) {
          if (err) {
            req.flash("error", `Cannot Edit due to ${err}`);
            res.redirect(`/campgrounds/${req.params.camp_id}`);
          } else {
            res.render("edit_camp", { camp });
          }
        } else {
          req.flash("error", "You are not an Authorized User");
          res.redirect(`/campgrounds/${req.params.camp_id}`);
        }
      }
    );
  }
});

router.put("/:camp_id/edit", (req, res) => {
  req.body.details = req.sanitize(req.body.details);
  const update_camp = {
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    details: req.body.details
  };
  campgrounds.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(req.params.camp_id) },
    update_camp,
    (err, updated_camp) => {
      if (err) {
        req.flash("error", `Campground cannot be update due to ${err}`);
        res.redirect(`/campgrounds/${req.params.camp_id}`);
      } else {
        console.log(updated_camp);
        req.flash("success", `Campground Updated Successfully`);
        res.redirect(`/campgrounds/${req.params.camp_id}`);
      }
    }
  );
});

function checkOwnerShip(req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    console.log("inside true");
    campgrounds.findOne(
      { _id: mongoose.Types.ObjectId(req.params.camp_id) },
      (err, camp) => {
        if (err) {
          req.flash("error", `Cannot delete due to ${err}`);
          res.redirect(`/campgrounds/${req.params.camp_id}`);
        } else {
          if (camp.authorId == req.user._id) {
            console.log("authenticated true");
            next();
          } else {
            req.flash("error", "Not Authorized User");
            res.redirect("back");
          }
        }
      }
    );
  } else {
    req.flash("error", "Login First");
    res.redirect("/login");
  }
}

router.delete("/:camp_id/delete", checkOwnerShip, (req, res) => {
  campgrounds.findOneAndDelete(
    { _id: mongoose.Types.ObjectId(req.params.camp_id) },
    (err, camp) => {
      if (camp.authorId === userId.toString()) {
        if (err) {
          req.flash("error", `Cannot Delete due to ${err}`);
          res.redirect(`/campgrounds/${req.params.camp_id}`);
        } else {
          users.updateOne(
            { _id: mongoose.Types.ObjectId(camp.authorId) },
            { $pull: { campgrounds: { _id: camp._id } } },
            (err, user) => {
              if (err) {
                console.log(err);
              } else {
                console.log(user);
              }
            }

            /*async (err, author) => {
                if (err) {
                  req.flash("error", `Cannot delete from Author due to ${err}`);
                } else {
                  await author.campgrounds.pull(
                    mongoose.Types.ObjectId(req.params.camp_id)
                  ); 
                  author
                    .save()
                    .then(author => console.log(author))
                    .catch(err => console.log(err));
                  }
              }*/
          );
          res.redirect("/campgrounds");
        }
      } else {
        req.flash("error", "You are not an Authorized User");
        res.redirect(`/campgrounds/${req.params.camp_id}`);
      }
    }
  );
});

router.delete(
  "/:camp_id/deleteComment/:comment_id",
  checkOwnerShip,
  (req, res) => {
    comments.findOneAndDelete(
      { _id: mongoose.Types.ObjectId(req.params.comment_id) },
      (err, comment) => {
        if (err) {
          req.flash("error", `Cannot Delete due to ${err}`);
          res.redirect("/users");
        } else {
          req.flash("success", "Comment successfully deleted");
          res.redirect("back"); //for redirecting to last open page
        }
      }
    );
  }
);

router.get("/:camp_id", (req, res) => {
  lastVisited = `campgrounds/${req.params.camp_id}`;
  campgrounds
    .findOne({ _id: mongoose.Types.ObjectId(req.params.camp_id) })
    .populate("comments")
    .exec((err, campground) => {
      if (err) {
        req.flash("error", `This campground cannot be fetched due to ${err}`);
        res.redirect("/campgrounds");
      } else {
        var views = campground.views;
        campground.views = views + 1;
        campground
          .save()
          .then(campground => console.log(campground.views))
          .catch(err => console.log(err));
        res.render("show_camp", {
          isSignedIn,
          userId,
          campground,
          username,
          liked
        });
      }
    });
});

/*router.post("/:camp_id/like", (req, res) => {
  console.log(liked);
  pusher.trigger("real-time", "real-time-like", {
    points: 1,
    like: req.body.like
  });
  return res.json({ success: true, message: "Like added" });
});*/

module.exports = router;
