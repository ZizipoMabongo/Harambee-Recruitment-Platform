// Transparent, rule-based candidate matching (0-100). Every point can be explained to the recruiter.
//   60 = skills, 20 = location, 20 = profile completeness
const norm = (s) => String(s || '').toLowerCase().trim();

export function scoreMatch(job, profile, docCount = 0) {
  const reasons = [];
  let score = 0;
  const need = (job.skills || []).map(norm).filter(Boolean);
  const have = new Set((profile.skills || []).map(norm).filter(Boolean));
  if (need.length) {
    const hit = need.filter((s) => have.has(s));
    score += Math.round((60 * hit.length) / need.length);
    reasons.push(`Skills: ${hit.length} of ${need.length} required skills matched${hit.length ? ` (${hit.join(', ')})` : ''}`);
  } else {
    const text = norm(`${job.title} ${job.description}`);
    const hit = [...have].filter((s) => text.includes(s));
    score += Math.min(60, hit.length * 15);
    reasons.push(`No required skills were listed; ${hit.length} candidate skill(s) appear in the job text`);
  }
  const a = norm(profile.location), b = norm(job.location);
  if (a && b && (a.includes(b) || b.includes(a))) { score += 20; reasons.push('Location matches'); }
  else reasons.push('Location differs or is missing');
  let c = 0;
  if (profile.headline) c += 4;
  if (profile.summary) c += 4;
  if (profile.experience?.length) c += 4;
  if (profile.education?.length) c += 4;
  if (docCount) c += 4;
  score += c;
  reasons.push(`Profile completeness: ${c} of 20`);
  return { score: Math.min(100, score), reasons };
}
export const labelFor = (s) => (s >= 70 ? 'strong' : s >= 40 ? 'possible' : 'low');
