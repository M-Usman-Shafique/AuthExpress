const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Post = require("./models/Post");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("register");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  // console.log(req.user) // req.user is received from "isLoggedIn" middleware
  let user = await User.findOne({ email: req.user.email }).populate("posts");
  res.render("profile", { user });
});

app.post("/post/create", isLoggedIn, async (req, res) => {
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

app.post("/register", async (req, res) => {
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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
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
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

// Middleware for protected routes:
function isLoggedIn(req, res, next) {
  let token = req.cookies.token;
  if (!token) {
    res.send("Sorry, you are not authorized to access this page.");
  } else {
    let data = jwt.verify(req.cookies.token, "shhhhhhhh");
    req.user = data; // very important line;
    // It passes the user's data to the protected routes so that if we want to use user's info. to show it on his profile page etc. we can do it, like for showing a Welcome <username> message.
    next();
  }
}

app.listen(3000);
