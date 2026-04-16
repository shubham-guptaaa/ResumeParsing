const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api/v1';

export async function matchText(resumeText, jds) {
  const response = await fetch(`${API_BASE}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, jds }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Server error ${response.status}`);
  }

  return response.json();
}

export async function matchPDFs(resumeFile, jdFiles) {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  jdFiles.forEach((file) => formData.append('jd', file));

  const response = await fetch(`${API_BASE}/match/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Server error ${response.status}`);
  }

  return response.json();
}
