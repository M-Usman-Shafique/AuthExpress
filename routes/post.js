import express from "express";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import isLoggedIn from "../middlewares/isLoggedIn.js";

const router = express.Router();

// Create a new post
router.post("/post/create", isLoggedIn, async (req, res) => {
  // Getting user to know who's going to create a post:
  let user = await User.findOne({ email: req.user.email });

  let { title, description, image } = req.body;
  let post = await Post.create({
    userId: user._id, // To let the post know its creator
    title,
    description,
    image,
  });

  user.posts.push(post._id); // To save each post's id inside its creator
  await user.save();
  res.redirect("/profile");
});

// Edit a post
router.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await Post.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
});

// Update a post
router.post("/update/:id", isLoggedIn, async (req, res) => {
  let post = await Post.findOneAndUpdate(
    { _id: req.params.id },
    {
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
    }
  );

  res.redirect("/profile");
});

// Like a post
router.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await Post.findOne({ _id: req.params.id }).populate("user");

  // console.log(req.user);
  if (post.likes.indexOf(req.user.userId) === -1) {
    post.likes.push(req.user.userId);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userId), 1);
  }

  await post.save();
  res.redirect("/profile");
});

export default router;
