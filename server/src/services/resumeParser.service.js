
import SKILL_CATALOGUE from "../utils/skillDictionary.util.js";
import { normalizeText, splitLines } from "../utils/textNormalizer.util.js";


const SALARY_LABELS = /expected\s+salary|current\s+ctc|desired\s+ctc|salary\s+expectation|expected\s+ctc/i;

/**
 * Regex to find salary values in different Indian / global formats.
 * Captures:   "12 LPA", "₹8,00,000 per annum", "$80,000/year", "8L CTC"
 */
const SALARY_VALUE_PATTERN =
  /(?:₹|Rs\.?|INR|USD|\$)?\s*[\d,]+(?:\.\d+)?\s*(?:LPA|L|lakh|lakhs|crore|crores|K|thousand|million|per\s+annum|per\s+year|\/year|\/annum|CTC)?/i;

const SALARY_FULL_PATTERN =
  /(?:(?:expected\s+)?(?:salary|ctc|compensation|package|remuneration)[\s:–-]*)((?:₹|Rs\.?|INR|USD|\$)?\s*[\d,]+(?:\.\d+)?\s*(?:LPA|L|lakh|lakhs|crore|crores|K|thousand|million|per\s+annum|per\s+year|\/year|\/annum|CTC)?(?:\s*[-–to]+\s*(?:₹|Rs\.?|INR|USD|\$)?\s*[\d,]+(?:\.\d+)?\s*(?:LPA|L|lakh|lakhs|crore|crores|K|thousand|million|per\s+annum|per\s+year|\/year|\/annum|CTC)?)?)/i;


function extractSalary(rawText) {
  const match = rawText.match(SALARY_FULL_PATTERN);
  if (match && match[1]) {
    return formatSalaryValue(match[1].trim());
  }
  return null;
}


function formatSalaryValue(salaryStr) {

  if (/[₹$£€]|lpa|ctc|lakh|crore|\bk\b|per\s+annum|per\s+year|\/year/i.test(salaryStr)) {
    return salaryStr;
  }


  const num = parseFloat(salaryStr.replace(/,/g, ""));
  if (!isNaN(num)) {
    return `$${num.toLocaleString("en-US")}`;
  }

  return salaryStr;
}


const MONTH_INDEX = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};


function parseDateString(dateStr) {
  const cleaned = dateStr.trim().toLowerCase();


  if (/^(present|current|now|till date|to date)$/.test(cleaned)) {
    return new Date();
  }

  // "MMM YYYY" e.g. "Jan 2020"
  const monthYear = cleaned.match(/^([a-z]+)[\s,-]+(\d{4})$/);
  if (monthYear) {
    const monthNum = MONTH_INDEX[monthYear[1]];
    if (monthNum !== undefined) {
      return new Date(parseInt(monthYear[2], 10), monthNum, 1);
    }
  }

  // "YYYY" only
  const yearOnly = cleaned.match(/^(\d{4})$/);
  if (yearOnly) {
    return new Date(parseInt(yearOnly[1], 10), 0, 1);
  }

  // "MM/YYYY" or "MM-YYYY"
  const numericMonthYear = cleaned.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (numericMonthYear) {
    return new Date(parseInt(numericMonthYear[2], 10), parseInt(numericMonthYear[1], 10) - 1, 1);
  }

  return null;
}

function calculateExperienceFromDateRanges(rawText) {
  const DATE_PART = `(?:[a-zA-Z]+\\.?\\s+)?\\d{4}`;
  const SEPARATOR = `\\s*[-–—to]+\\s*`;
  const DATE_RANGE_PATTERN = new RegExp(
    `(${DATE_PART})${SEPARATOR}(${DATE_PART}|present|current|now|till\\s+date|to\\s+date)`,
    "gi"
  );

  let totalMonths = 0;
  const seenRanges = new Set();
  let rangeMatch;

  while ((rangeMatch = DATE_RANGE_PATTERN.exec(rawText)) !== null) {
    const key = rangeMatch[0].toLowerCase().replace(/\s+/g, " ");
    if (seenRanges.has(key)) continue;
    seenRanges.add(key);

    const startDate = parseDateString(rangeMatch[1]);
    const endDate   = parseDateString(rangeMatch[2]);

    if (startDate && endDate && endDate > startDate) {
      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      totalMonths += months;
    }
  }

  if (totalMonths === 0) return null;
  return Math.round((totalMonths / 12) * 10) / 10; // 1 decimal place
}


function extractExplicitYears(rawText) {
  // Fresher 
  if (/\b(fresher|entry[\s-]?level|no experience|0 years?)\b/i.test(rawText)) {
    return 0;
  }

  // "X years" / "X+ years" / "X.Y years"
  const yrsMatch = rawText.match(
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:experience|exp|work\s+experience)/i
  );
  if (yrsMatch) return parseFloat(yrsMatch[1]);

  // "experience: X years"
  const expLabel = rawText.match(/experience[\s:–-]+(\d+(?:\.\d+)?)\s*\+?\s*years?/i);
  if (expLabel) return parseFloat(expLabel[1]);

  return null;
}


function extractYearsOfExperience(rawText) {
  const explicit = extractExplicitYears(rawText);
  if (explicit !== null) return explicit;

  const fromRanges = calculateExperienceFromDateRanges(rawText);
  if (fromRanges !== null) return fromRanges;

  return 0;
}

//  Skills Extraction 


function extractSkills(rawText) {

  const padded = ` ${normalizeText(rawText)} `;
  const foundSkills = new Set();

  for (const { canonical, aliases } of SKILL_CATALOGUE) {
    for (const alias of aliases) {

      const escaped = alias.replace(/[.+]/g, "\\$&");
      const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
      if (pattern.test(padded)) {
        foundSkills.add(canonical);
        break; 
      }
    }
  }

  return Array.from(foundSkills);
}


function extractName(rawText) {
  const lines = splitLines(rawText);

  for (const line of lines.slice(0, 10)) {
    // Skip lines that look like contact info or section headers
    if (/[@+\d()\-–\/\\]/.test(line) && line.length < 30) continue;
    if (/^(resume|curriculum\s+vitae|cv|profile|summary|objective)$/i.test(line.trim())) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (line.length > 60) continue; // too long to be a name

    // Accept lines that look like a name (only letters, dots, spaces)
    if (/^[A-Za-z][A-Za-z.\s'-]{1,50}$/.test(line.trim())) {
      return line.trim();
    }
  }

  return "Unknown";
}


function parseResume(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new TypeError("parseResume expects a non-empty string");
  }

  const name              = extractName(rawText);
  const salary            = extractSalary(rawText);
  const yearOfExperience  = extractYearsOfExperience(rawText);
  const resumeSkills      = extractSkills(rawText);

  return {
    name,
    salary,
    yearOfExperience,
    resumeSkills,
  };
}

export { parseResume, extractSkills, extractYearsOfExperience, extractSalary, extractName };
