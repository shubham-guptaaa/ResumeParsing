export default function CandidateCard({ result }) {
  const { name, salary, yearOfExperience, resumeSkills = [] } = result;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
        Candidate Info
      </h2>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase">Name</p>
          <p className="font-semibold text-gray-900 mt-0.5">{name || '—'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase">Salary</p>
          <p className="font-semibold text-gray-900 mt-0.5">{salary || 'Not found'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase">Experience</p>
          <p className="font-semibold text-gray-900 mt-0.5">
            {yearOfExperience === 0 ? 'Fresher' : `${yearOfExperience} yrs`}
          </p>
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase mb-2">
          Resume Skills ({resumeSkills.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {resumeSkills.length > 0 ? (
            resumeSkills.map((skill) => (
              <span
                key={skill}
                className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-medium"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">No skills detected</span>
          )}
        </div>
      </div>
    </div>
  );
}
