const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://usmantest:usmantest@clusterx.2v7zn.mongodb.net/TestBase"
);

const postSchema = mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
