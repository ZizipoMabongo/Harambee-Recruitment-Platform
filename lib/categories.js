export const CATEGORIES = [
  { id: 'profile', name: 'Creating a profile' },
  { id: 'cv', name: 'Uploading a CV' },
  { id: 'apply', name: 'Applying for jobs' },
  { id: 'interview', name: 'Interview preparation' },
  { id: 'password', name: 'Password recovery' },
  { id: 'recruiter', name: 'Recruiter support' },
  { id: 'faq', name: 'Frequently asked questions' },
];
export const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name || id;
