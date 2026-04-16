

let _pdfParse = null;


async function loadPdfParse() {
  if (_pdfParse) return _pdfParse;

  const mod = await import("pdf-parse");
  if (typeof mod.default === "function") {
    _pdfParse = mod.default;
  } else if (typeof mod === "function") {
    _pdfParse = mod;
  } else if (typeof mod.PDFParse === "function") {
    _pdfParse = (buffer) => {
      const parser = new mod.PDFParse({ data: buffer });
      return parser.getText();
    };
  } else {
    throw new Error(
      "pdf-parse did not export a valid parser. " +
      `Got: ${typeof mod}. Keys: ${Object.keys(mod).join(", ")}`
    );
  }

  return _pdfParse;
}


async function extractTextFromPDF(pdfBuffer) {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new TypeError("extractTextFromPDF expects a Buffer");
  }

  const pdfParse = await loadPdfParse();
  const parsed   = await pdfParse(pdfBuffer);
  return parsed.text || "";
}

export { extractTextFromPDF };
