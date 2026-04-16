import { parseResume } from "../services/resumeParser.service.js";
import { parseJD } from "../services/jdParser.service.js";
import { matchResumeToJDs } from "../services/jobMatcher.service.js";
import { extractTextFromPDF } from "../utils/pdfExtractor.util.js";

const matchTextInput = (req, res) => {
  const { resumeText, jds } = req.body;

  if (!resumeText || typeof resumeText !== "string" || resumeText.trim() === "") {
    return res.status(400).json({ error: "resumeText is required and must be a non-empty string." });
  }

  if (!Array.isArray(jds) || jds.length === 0) {
    return res.status(400).json({ error: "jds must be a non-empty array of { jobId?, jdText } objects." });
  }

  for (let i = 0; i < jds.length; i++) {
    if (!jds[i].jdText || typeof jds[i].jdText !== "string" || jds[i].jdText.trim() === "") {
      return res.status(400).json({ error: `jds[${i}].jdText is required and must be a non-empty string.` });
    }
  }

  try {
    const parsedResume = parseResume(resumeText);
    const parsedJDs    = jds.map((jd) => parseJD(jd.jdText, jd.jobId));
    const result       = matchResumeToJDs(parsedResume, parsedJDs);

    return res.status(200).json(result);
  } catch (err) {
    console.error("[matchTextInput] Error:", err.message);
    return res.status(500).json({ error: "Internal error during parsing. Please check your input text." });
  }
};

const matchPDFUpload = async (req, res) => {
  const resumeFile = req.files?.resume?.[0];
  const jdFiles    = req.files?.jd;

  if (!resumeFile) {
    return res.status(400).json({ error: "A resume PDF file is required (field name: 'resume')." });
  }

  if (!jdFiles || jdFiles.length === 0) {
    return res.status(400).json({ error: "At least one JD PDF file is required (field name: 'jd')." });
  }

  try {
    const resumeText = await extractTextFromPDF(resumeFile.buffer);
    if (!resumeText.trim()) {
      return res.status(422).json({ error: "Could not extract text from the resume PDF. Ensure it is not a scanned image." });
    }

    const jdTexts = await Promise.all(
      jdFiles.map((file) => extractTextFromPDF(file.buffer))
    );

    const parsedResume = parseResume(resumeText);
    const parsedJDs    = jdTexts.map((text, index) => {
      if (!text.trim()) {
        throw new Error(`Could not extract text from JD file #${index + 1}. Ensure it is not a scanned image.`);
      }
      return parseJD(text);
    });

    const result = matchResumeToJDs(parsedResume, parsedJDs);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[matchPDFUpload] Error:", err.message);
    return res.status(500).json({ error: err.message || "Internal error during PDF processing." });
  }
};

export { matchTextInput, matchPDFUpload };