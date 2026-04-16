import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import CandidateCard from './components/CandidateCard';
import JobMatchCard from './components/JobMatchCard';
import { matchText, matchPDFs } from './api/matchApi';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = payload.mode === 'text'
        ? await matchText(payload.resumeText, payload.jds)
        : await matchPDFs(payload.resumeFile, payload.jdFiles);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-5xl px-4 py-8 mx-auto space-y-8">
        <section className="p-6 bg-white border border-gray-200 rounded-lg">
          <h2 className="mb-5 text-sm font-bold tracking-wide text-gray-700 uppercase">
            Input
          </h2>
          <InputForm onSubmit={handleSubmit} loading={loading} />
        </section>

        {error && (
          <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <section id="results-section" className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                Results — {result.matchingJobs?.length ?? 0} job{result.matchingJobs?.length !== 1 ? 's' : ''} matched
              </h2>
              <button
                id="start-over-btn"
                onClick={() => { setResult(null); setError(null); }}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Start Over
              </button>
            </div>
            <CandidateCard result={result} />
            {result.matchingJobs?.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Matching Jobs (sorted by score)</p>
                {result.matchingJobs.map((job, idx) => (
                  <JobMatchCard key={job.jobId ?? idx} job={job} rank={idx + 1} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No jobs matched.</p>
            )}
            <details className="overflow-hidden bg-white border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer select-none hover:bg-gray-50">
                View Raw JSON Output
              </summary>
              <pre className="px-4 pt-2 pb-4 overflow-x-auto font-mono text-xs text-gray-700 border-t border-gray-200 bg-gray-50">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </section>
        )}
      </main>
    </div>
  );
}
