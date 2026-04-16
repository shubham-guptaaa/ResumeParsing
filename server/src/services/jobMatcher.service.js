function normalizeSkillName(skillName) {
  return skillName.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildResumeSkillSet(resumeSkills) {
  return new Set(resumeSkills.map(normalizeSkillName));
}

function buildSkillsAnalysis(jdSkills, resumeSkillSet) {
  return jdSkills.map((skill) => ({
    skill,
    presentInResume: resumeSkillSet.has(normalizeSkillName(skill)),
  }));
}

function calculateMatchingScore(jdSkills, resumeSkillSet) {
  if (!jdSkills || jdSkills.length === 0) return 0;

  const matchedCount = jdSkills.filter((skill) =>
    resumeSkillSet.has(normalizeSkillName(skill))
  ).length;

  const score = (matchedCount / jdSkills.length) * 100;
  return Math.round(score * 100) / 100;
}

function matchResumeToJDs(parsedResume, parsedJDs) {
  const resumeSkillSet = buildResumeSkillSet(parsedResume.resumeSkills);

  const matchingJobs = parsedJDs.map((jd) => {
    const allJDSkills = [
      ...new Set([...(jd.requiredSkills || []), ...(jd.optionalSkills || [])]),
    ];

    const skillsAnalysis = buildSkillsAnalysis(allJDSkills, resumeSkillSet);
    const matchingScore = calculateMatchingScore(allJDSkills, resumeSkillSet);

    return {
      jobId: jd.jobId,
      role: jd.role,
      aboutRole: jd.aboutRole,
      skillsAnalysis,
      matchingScore,
    };
  });

  matchingJobs.sort((a, b) => b.matchingScore - a.matchingScore);

  return {
    name: parsedResume.name,
    salary: parsedResume.salary,
    yearOfExperience: parsedResume.yearOfExperience,
    resumeSkills: parsedResume.resumeSkills,
    matchingJobs,
  };
}

export { matchResumeToJDs, buildSkillsAnalysis, calculateMatchingScore, buildResumeSkillSet };
