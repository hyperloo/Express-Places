const mongoose = require("mongoose");

const campgroundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: String, required: true },
  created: { type: Date, default: Date.now },
  author: { type: String },
  authorId: { type: String },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment" //collection name by automatically small and pluralizing it
    }
  ]
});

module.exports = mongoose.model("campground", campgroundSchema);
