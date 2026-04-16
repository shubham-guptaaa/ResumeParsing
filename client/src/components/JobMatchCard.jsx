export default function JobMatchCard({ job, rank }) {
  const { jobId, role, aboutRole, skillsAnalysis = [], matchingScore } = job;
  const score = typeof matchingScore === 'number' ? matchingScore : 0;
  const matched = skillsAnalysis.filter((item) => item.presentInResume).length;
  const total = skillsAnalysis.length;

  const scoreColor =
    score >= 75 ? 'text-green-700 bg-green-50 border-green-200'
    : score >= 50 ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
    : 'text-red-700 bg-red-50 border-red-200';

  const barColor =
    score >= 75 ? 'bg-green-500'
    : score >= 50 ? 'bg-yellow-500'
    : 'bg-red-500';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400 font-medium">#{rank}</span>
            <span className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded font-mono">
              {jobId}
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900">{role}</h3>
          {aboutRole && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{aboutRole}</p>
          )}
        </div>
        <div className={`shrink-0 border rounded-lg px-4 py-2 text-center ${scoreColor}`}>
          <div className="text-2xl font-bold">{score}%</div>
          <div className="text-xs font-medium">Match</div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{matched} / {total} skills matched</span>
          <span>{score}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Skills Analysis</p>
        <div className="flex flex-wrap gap-1.5">
          {skillsAnalysis.map(({ skill, presentInResume }) => (
            <span
              key={skill}
              className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                presentInResume
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
            >
              {presentInResume ? '✓' : '✗'} {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
