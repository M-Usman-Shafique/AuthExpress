import express from "express";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Home route (Check for token and redirect to profile if logged in)
router.get("/", (req, res) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, "shhhhhhhh");
    return res.redirect("/profile");
  }
  res.render("register");
});

// Register route
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

// Login route
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

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

export default router;
