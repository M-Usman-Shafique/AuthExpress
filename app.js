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

app.get("/profile", isLoggedIn, (req, res) => {
  // console.log(req.user)
  res.render("profile", {user: req.user}); // req.user is received from "isLoggedIn" middleware
});

app.get("/post", isLoggedIn, (req, res) => {
  res.render("post");
});

app.post("/post/create", async (req, res) => {
  let { title, description, image } = req.body;
  let post = await Post.create({
    title,
    description,
    image,
  });
  res.redirect("/posts");
});

app.get("/posts", isLoggedIn, async (req, res) => {
  let posts = await Post.find();
  res.render("posts", { posts });
});

app.post("/register", (req, res) => {
  let { username, email, password } = req.body;

  if (user) {
    return res.send("User already registered");
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await User.create({
        username,
        email,
        password: hash,
      });

      // To set JWT as cookie to login the user after register:
      let token = jwt.sign({ email }, "shhhhhhhh");
      res.cookie("token", token);
      //   console.log(token);
      res.render("login");
    });
  });
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
      let token = jwt.sign({ email: user.email }, "shhhhhhhh");
      res.cookie("token", token);
      res.render("profile", { user });
    } else {
      res.send("Login failed. Try again...");
      res.redirect("/login");
    }
  });
});

// Logout the user by removing the JWT from cookie:
app.post("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

// Middleware for protected routes:
function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") {
    res.send("Sorry, you are not authorized to access this.");
  } else {
    let data = jwt.verify(req.cookies.token, "shhhhhhhh");
    req.user = data; // very important line;
    // It passes the user's data to the protected routes so that if we want to use user's info. to show it on his profile page etc. we can do it, like for showing a Welcome <username> message.
    next();
  }
}

app.listen(3000);
