import { useState } from 'react';

const DEFAULT_JD = { id: 1, jobId: '', jdText: '' };

export default function InputForm({ onSubmit, loading }) {
  const [mode, setMode] = useState('text');
  const [resumeText, setResumeText] = useState('');
  const [jds, setJds] = useState([DEFAULT_JD]);
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFiles, setJdFiles] = useState([]);

  const addJD = () => setJds((prev) => [...prev, { id: Date.now(), jobId: '', jdText: '' }]);
  const removeJD = (id) => setJds((prev) => prev.filter((item) => item.id !== id));
  const updateJD = (id, field, value) =>
    setJds((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === 'text') {
      onSubmit({
        mode: 'text',
        resumeText,
        jds: jds.map(({ jobId, jdText }) => ({ jobId: jobId || undefined, jdText })),
      });
    } else {
      onSubmit({ mode: 'pdf', resumeFile, jdFiles });
    }
  };

  const canSubmit =
    mode === 'text'
      ? resumeText.trim() && jds.every((item) => item.jdText.trim())
      : resumeFile && jdFiles.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex border border-gray-300 rounded-lg overflow-hidden w-fit">
        {[{ id: 'text', label: 'Paste Text' }, { id: 'pdf', label: 'Upload PDF' }].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              mode === id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'text' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Resume Text</label>
            <textarea
              id="resume-text-input"
              rows={14}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 bg-white"
              placeholder={"John Doe\njohn@email.com\n\n5 years of experience\n\nSkills: Java, Spring Boot, Docker...\n\nExpected Salary: 12 LPA"}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            {jds.map((jd, idx) => (
              <div key={jd.id} className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">JD #{idx + 1}</span>
                  {jds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeJD(jd.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  id={`jd-id-${idx}`}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Job ID (optional, e.g. JD001)"
                  value={jd.jobId}
                  onChange={(e) => updateJD(jd.id, 'jobId', e.target.value)}
                />
                <textarea
                  id={`jd-text-${idx}`}
                  rows={8}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  placeholder={"Role: Backend Developer\nSalary: 12 LPA\n4+ years of experience\n\nRequired Skills\nJava, Spring Boot, MySQL..."}
                  value={jd.jdText}
                  onChange={(e) => updateJD(jd.id, 'jdText', e.target.value)}
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addJD}
              className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add Another JD
            </button>
          </div>
        </div>
      )}

      {mode === 'pdf' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Resume PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Job Description PDF(s)</label>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => setJdFiles(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>
        </div>
      )}

      <button
        id="analyze-btn"
        type="submit"
        disabled={!canSubmit || loading}
        className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Analyzing...' : 'Analyze & Match'}
      </button>
    </form>
  );
}
