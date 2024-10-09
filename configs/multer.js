import crypto from "crypto";
import multer from "multer";
import path from "path";

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

export const upload = multer({ storage: storage });
