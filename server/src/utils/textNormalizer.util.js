function normalizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

function splitLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[\s,;|•·\-\/\\()\[\]{}"']+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function stripSpecialChars(text) {
  return text.replace(/[^a-zA-Z0-9 .#+\-]/g, " ").replace(/ {2,}/g, " ").trim();
}

function extractSection(text, sectionPattern, nextSectionPattern) {
  const lines = text.split(/\r?\n/);
  let insideSection = false;
  const sectionLines = [];

  for (const line of lines) {
    if (sectionPattern.test(line)) {
      insideSection = true;
      continue;
    }

    if (insideSection) {
      const isNewSection =
        nextSectionPattern
          ? nextSectionPattern.test(line)
          : /^[A-Z][A-Z\s\/&-]{3,}:?\s*$/.test(line.trim());

      if (isNewSection) break;
      sectionLines.push(line);
    }
  }

  return sectionLines.join("\n").trim();
}

export { normalizeText, splitLines, tokenize, stripSpecialChars, extractSection };
