import express from "express";
import multer from "multer";

import { matchTextInput, matchPDFUpload } from "../controllers/match.controllers.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype === "application/pdf") {
      callback(null, true);
    } else {
      callback(new Error(`Only PDF files are accepted. Received: ${file.mimetype}`), false);
    }
  },
});

const pdfFields = upload.fields([
  { name: "resume", maxCount: 1 },
  { name: "jd", maxCount: 10 },
]);
router.post("/match", matchTextInput);

router.post("/match/upload", pdfFields, matchPDFUpload);

router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message?.startsWith("Only PDF")) {
    return res.status(400).json({ error: err.message });
  }
  throw err;
});

export default router;