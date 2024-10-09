import express from "express";
import { User } from "../models/User.js";
import path from "path";
import fs from "fs";
import { upload } from "../configs/multer.js";
import isLoggedIn from "../middlewares/isLoggedIn.js";

const router = express.Router();

// Get profile
router.get("/profile", isLoggedIn, async (req, res) => {
  // console.log(req.user) // req.user is received from "isLoggedIn" middleware
  let user = await User.findOne({ email: req.user.email }).populate("posts");

  // Check if the avatar exists on disk
  const avatarPath = path.join(process.cwd(), "public", "uploads", user.avatar);

  // If the file doesn't exist, set the avatar to default.png
  if (!fs.existsSync(avatarPath)) {
    user.avatar = "default.png";
  }
  res.render("profile", { user });
});

// Avatar route
router.get("/profile/avatar", isLoggedIn, (req, res) => {
  res.render("avatar");
});

// Upload avatar
router.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
  let user = await User.findOne({ _id: req.user.userId });

  if (req.file) {
    user.avatar = req.file.filename;
    await user.save();
  }
  res.redirect("/profile");
});

export default router;
