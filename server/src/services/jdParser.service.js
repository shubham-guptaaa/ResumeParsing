import SKILL_CATALOGUE from "../utils/skillDictionary.util.js";
import { normalizeText, splitLines, extractSection } from "../utils/textNormalizer.util.js";

const JD_SALARY_PATTERN =
  /(?:salary|ctc|compensation|package|remuneration|pay)[\s:–\-]*((?:up\s*to\s*)?(?:₹|Rs\.?|INR|USD|\$)?\s*[\d,]+(?:\.\d+)?\s*(?:LPA|L|lakh|lakhs|crore|crores|K|thousand|million|per\s+annum|per\s+year|\/year|\/annum|CTC)?(?:\s*[-–to]+\s*(?:₹|Rs\.?|INR|USD|\$)?\s*[\d,]+(?:\.\d+)?\s*(?:LPA|L|lakh|lakhs|crore|crores|K|thousand|million|per\s+annum|per\s+year|\/year|\/annum|CTC)?)?)/i;

function extractJDSalary(rawText) {
  const match = rawText.match(JD_SALARY_PATTERN);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

function extractJDExperience(rawText) {
  if (/\b(fresher|entry[\s-]?level|0[\s-]?years?)\b/i.test(rawText)) {
    return 0;
  }

  const rangeMatch = rawText.match(/(\d+)\s*[-–]\s*\d+\s*\+?\s*years?\s+(?:of\s+)?(?:experience|exp)/i);
  if (rangeMatch) return parseInt(rangeMatch[1], 10);

  const singleMatch = rawText.match(/(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:experience|exp|work)/i);
  if (singleMatch) return parseFloat(singleMatch[1]);

  const labelMatch = rawText.match(/experience[\s:–\-]+(\d+(?:\.\d+)?)\s*\+?\s*years?/i);
  if (labelMatch) return parseFloat(labelMatch[1]);

  const minMatch = rawText.match(/(?:minimum|min\.?|at\s+least)\s+(\d+)\s*\+?\s*years?/i);
  if (minMatch) return parseInt(minMatch[1], 10);

  return "N/A";
}

const REQUIRED_SECTION_PATTERN =
  /^\s*(required\s+skills?|must[\s-]have|mandatory\s+skills?|technical\s+skills?|key\s+skills?|skills?\s+required|qualifications?\s+required|primary\s+skills?)\s*:?\s*$/i;

const OPTIONAL_SECTION_PATTERN =
  /^\s*(good[\s-]to[\s-]have|optional\s+skills?|nice[\s-]to[\s-]have|preferred\s+skills?|secondary\s+skills?|bonus\s+skills?|additional\s+skills?)\s*:?\s*$/i;

const ANY_SECTION_PATTERN =
  /^\s*(?:[A-Z][A-Z\s\/&\-]{3,}|(?:[A-Z][a-zA-Z]*\s*){1,6}(?:Qualifications?|Requirements?|Responsibilities|Skills?|Overview|Summary|Experience|Education|Benefits?|Compensation|Clearance|Statement|Comp)?)\s*:?\s*$/;

function scanSkillsInText(text) {
  const padded = ` ${normalizeText(text)} `;
  const found = new Set();

  for (const { canonical, aliases } of SKILL_CATALOGUE) {
    for (const alias of aliases) {
      const escaped = alias.replace(/[.+]/g, "\\$&");
      const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
      if (pattern.test(padded)) {
        found.add(canonical);
        break;
      }
    }
  }

  return Array.from(found);
}

function extractJDSkills(rawText) {
  const requiredSection = extractSection(rawText, REQUIRED_SECTION_PATTERN, ANY_SECTION_PATTERN);
  const optionalSection = extractSection(rawText, OPTIONAL_SECTION_PATTERN, ANY_SECTION_PATTERN);

  let requiredSkills = [];
  let optionalSkills = [];

  if (requiredSection) {
    requiredSkills = scanSkillsInText(requiredSection);
  }

  if (optionalSection) {
    optionalSkills = scanSkillsInText(optionalSection);
    optionalSkills = optionalSkills.filter((s) => !requiredSkills.includes(s));
  }

  if (requiredSkills.length === 0) {
    requiredSkills = scanSkillsInText(rawText);
  }

  return { requiredSkills, optionalSkills };
}

const GENERIC_HEADINGS = new Set([
  "overview", "summary", "responsibilities", "qualifications", "requirements",
  "description", "introduction", "background", "about", "skills", "experience",
  "education", "benefits", "compensation", "location", "contact", "apply",
  "position", "note", "notice", "disclaimer",
  "position overview", "job description", "job summary", "job overview",
  "about the role", "about the job", "about the company", "about us",
  "role overview", "role summary", "role description",
  "required qualifications", "desired qualifications", "preferred qualifications",
  "key responsibilities", "job responsibilities", "primary responsibilities",
  "what you will do", "what we offer", "why join us",
  "global comp", "closing statement",
]);

function extractRole(rawText) {
  const labelMatch = rawText.match(
    /(?:role|position|job\s+title|designation)[\s:–\-]+([A-Za-z][A-Za-z\s\/&+#.(),-]{2,80})/i
  );
  if (labelMatch) {
    return labelMatch[1].trim().split("\n")[0].trim();
  }

  const seekingMatch = rawText.match(
    /(?:seeking|hiring|looking\s+for)\s+a(?:n)?\s+([A-Za-z][A-Za-z\s\/&+#.,()-]{4,80}?)(?=\s+to\s+(?:support|join|lead|develop|build|work|help|manage|design)|[,.\n])/i
  );
  if (seekingMatch) {
    return seekingMatch[1].trim();
  }

  const lines = splitLines(rawText);
  for (const line of lines.slice(0, 15)) {
    const trimmed = line.trim();
    if (trimmed.length < 5 || trimmed.length > 100) continue;
    if (!(/^[A-Za-z]/).test(trimmed)) continue;
    if (GENERIC_HEADINGS.has(trimmed.toLowerCase())) continue;
    if (/^[A-Z\s]{5,}$/.test(trimmed)) continue;
    if (/\b(nonprofit|not-for-profit|company|corporation|institute|citizenship|clearance|u\.s\.)\b/i.test(trimmed)) continue;
    if (/\b(inc|ltd|pvt|llc|gmbh|corp|research|institute)\b/i.test(trimmed) && trimmed.split(' ').length <= 4) continue;
    if (trimmed.split(/\s+/).length < 2) continue;

    return trimmed;
  }

  return "Unknown Role";
}

let autoIdCounter = 1;

function extractJobId(rawText) {
  const idMatch = rawText.match(
    /(?:job\s+id|jd[\s-]?id|requisition[\s-]?(?:id|no)?|req[\s-]?(?:id|no)?|opening[\s-]?id)[\s:–\-#]+([A-Za-z0-9\-_]+)/i
  );
  if (idMatch) return idMatch[1].trim().toUpperCase();

  const codeMatch = rawText.match(/\b(JD[\s\-]?\d{2,6}|REQ[\s\-]?\d{2,6})\b/i);
  if (codeMatch) return codeMatch[1].toUpperCase().replace(/\s/g, "");

  return `JD${String(autoIdCounter++).padStart(3, "0")}`;
}

const ABOUT_SECTION_PATTERN =
  /^\s*(about\s+(the\s+)?role|job\s+(description|summary|overview|brief)|role\s+(summary|overview|description)|position\s+(overview|summary|description)|overview|responsibilities\s+overview)\s*:?\s*$/i;

const BOILERPLATE_STARTS =
  /^(we are |our company|founded in|about us|headquartered|riverside|the company|[a-z]+\s+(?:is an?|was founded|provides|offers)\b)/i;

function extractAboutRole(rawText) {
  const section = extractSection(rawText, ABOUT_SECTION_PATTERN, ANY_SECTION_PATTERN);
  if (section) {
    const cleanedLines = section
      .split("\n")
      .filter((line) => !ANY_SECTION_PATTERN.test(line))
      .join("\n")
      .trim();
    const firstChunk = cleanedLines.split(/\.\s+/).slice(0, 3).join(". ").trim();
    return firstChunk.length > 500 ? firstChunk.slice(0, 500) + "\u2026" : firstChunk;
  }

  const paragraphs = rawText.split(/\n{2,}/);
  for (const para of paragraphs) {
    const cleaned = para.trim();
    if (cleaned.length < 80) continue;
    if (/^(salary|ctc|role|position|job\s+id|compensation|closing)/i.test(cleaned)) continue;
    if (BOILERPLATE_STARTS.test(cleaned)) continue;
    if (ANY_SECTION_PATTERN.test(cleaned)) continue;

    const firstChunk = cleaned.split(/\.\s+/).slice(0, 3).join(". ").trim();
    return firstChunk.length > 500 ? firstChunk.slice(0, 500) + "\u2026" : firstChunk;
  }

  for (const para of paragraphs) {
    const cleaned = para.trim();
    if (cleaned.length > 80 && !ANY_SECTION_PATTERN.test(cleaned)) {
      const firstChunk = cleaned.split(/\.\s+/).slice(0, 2).join(". ").trim();
      return firstChunk.length > 500 ? firstChunk.slice(0, 500) + "\u2026" : firstChunk;
    }
  }

  return "";
}

function parseJD(rawText, jobId) {
  if (!rawText || typeof rawText !== "string") {
    throw new TypeError("parseJD expects a non-empty string");
  }

  const { requiredSkills, optionalSkills } = extractJDSkills(rawText);

  return {
    jobId:            jobId || extractJobId(rawText),
    role:             extractRole(rawText),
    aboutRole:        extractAboutRole(rawText),
    salary:           extractJDSalary(rawText),
    yearOfExperience: extractJDExperience(rawText),
    requiredSkills,
    optionalSkills,
  };
}

export {
  parseJD,
  extractJDSkills,
  extractJDSalary,
  extractJDExperience,
  extractRole,
  extractJobId,
  extractAboutRole,
  scanSkillsInText,
};
