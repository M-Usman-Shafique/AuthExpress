const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://usman:usman@cluster.wmnbp.mongodb.net/TestBase"
);

const userSchema = mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    age: Number,
  },
);

module.exports = mongoose.model("User", userSchema);