const mongoose = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String },
  lastLogin: { type: Date, default: Date.now },
  registeredOn: { type: Date, default: Date.now },
  campgrounds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "campground"
    }
  ]
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

userSchema.methods.validPassword = pwd => {
  return this.password === pwd; //this.password will extract password from the found user
  //in findOne and compare it with the password pwd from form
};

module.exports = mongoose.model("user", userSchema);
