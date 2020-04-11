const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: String,
  author: String,
  commentedOn: { type: Date, default: Date.now() }
});

module.exports = mongoose.model("comment", commentSchema);
