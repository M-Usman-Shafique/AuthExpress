const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let { username, email, password, age } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await User.create({
        username,
        email,
        password: hash,
        age,
      });

      // To set JWT as cookie to login the user after register:
      let token = jwt.sign({ email }, "shhhhhhhh");
      res.cookie("token", token);
      console.log(token);
      res.send(user);
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
      let token = jwt.sign({email: user.email }, "shhhhhhhh");
      res.cookie("token", token);
      res.render("profile", {user});
    } else res.send("Login failed");
  });
});

// Logout the user by removing the JWT from cookie:
app.post("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.listen(3000);