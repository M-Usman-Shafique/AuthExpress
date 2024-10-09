import jwt from "jsonwebtoken";

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

  export default isLoggedIn;