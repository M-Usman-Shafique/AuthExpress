import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: {
    type: String,
    trim: true,
    minLength: 3,
  },
  email: {
    type: String,
    trim: true,
  },
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

export const User = mongoose.model("User", userSchema);
