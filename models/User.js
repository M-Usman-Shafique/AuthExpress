const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://usmantest:usmantest@clusterx.2v7zn.mongodb.net/TestBase"
);

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  avatar: {
    type: String,
    default: "default.png",
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
