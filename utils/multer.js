const crypto = require("crypto");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
      // to encrypt original name
      crypto.randomBytes(12, (err, bytes) => {
        // Etract extension from original name and join it with encrypted name:
        const fn = bytes.toString("hex") + path.extname(file.originalname);
         // Setting the filename
        cb(null, fn);
      });
    },
  });
  
  const upload = multer({ storage: storage });

  module.exports = upload;