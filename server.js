import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(cookieParser());

// Use the routes
app.use("/", authRoutes);
app.use("/", postRoutes);
app.use("/", profileRoutes);

connectDB()
  .then(async () => {
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
