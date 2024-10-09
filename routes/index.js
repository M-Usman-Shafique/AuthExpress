import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import upload from "../utils/multer.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Middleware for protected routes:
function isLoggedIn(req, res, next) {
  let token = req.cookies.token;
  if (!token) {
    return res.send("Sorry, you are not authorized to access this page.");
  }
  let data = jwt.verify(req.cookies.token, "shhhhhhhh");
  req.user = data; // very important line;
  // It passes the user's data to the protected routes so that if we want to use user's info. to show it on his profile page etc. we can do it, like for showing a Welcome <username> message.
  next();
}

// Routes
router.get("/", (req, res) => {
    let token = req.cookies.token;
  
    if (token) {
      jwt.verify(token, "shhhhhhhh");
      return res.redirect("/profile");
    }
    res.render("register");
  });

app.get("/profile/avatar", isLoggedIn, (req, res) => {
  res.render("avatar");
});

app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
  let user = await User.findOne({ _id: req.user.userId });

  if (req.file) {
    user.avatar = req.file.filename;
    await user.save();
  }
  res.redirect("/profile");
});

router.get("/profile", isLoggedIn, async (req, res) => {
  // console.log(req.user) // req.user is received from "isLoggedIn" middleware
  let user = await User.findOne({ email: req.user.email }).populate("posts");

  // Check if the avatar exists on disk
  const avatarPath = path.join(__dirname, "public", "uploads", user.avatar);

  // If the file doesn't exist, set the avatar to default.png
  if (!fs.existsSync(avatarPath)) {
    user.avatar = "default.png";
  }
  res.render("profile", { user });
});

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

router.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await Post.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
});

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

router.post("/register", async (req, res) => {
  let { username, email, password } = req.body;

  // Check if the user already exists
  let existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.send("User already registered");
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Create the user
  let user = await User.create({
    username,
    email,
    password: hash,
  });

  // To set JWT as cookie to login the user after registration:
  let token = jwt.sign({ email: user.email, userId: user._id }, "shhhhhhhh");
  res.cookie("token", token);
  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) res.send("Something went wrong");

  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if (result) {
      // Setting JWT as cookie to keep the user login:
      let token = jwt.sign(
        { email: user.email, userId: user._id },
        "shhhhhhhh"
      );
      res.cookie("token", token);
      res.redirect("/profile");
    } else {
      res.send("Login failed. Try again...");
      res.redirect("/login");
    }
  });
});

// Logout the user by removing the JWT from cookie:
router.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

export default router;
