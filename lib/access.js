import Job from '@/models/Job';
import Application from '@/models/Application';

// Who may see a candidate profile (and its documents)?
// Owner and admin always. Recruiters when the candidate made the profile visible,
// or when the candidate applied to one of that recruiter's vacancies.
export async function canViewProfile(user, profile) {
  if (!user || !profile) return false;
  if (user.role === 'admin' || String(profile.user) === user.id) return true;
  if (user.role !== 'recruiter') return false;
  if (profile.visible) return true;
  const jobs = await Job.find({ recruiter: user.id }).distinct('_id');
  return !!(await Application.exists({ candidate: profile.user, job: { $in: jobs } }));
}
