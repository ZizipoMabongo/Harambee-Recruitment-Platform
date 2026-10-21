// Run: npm run seed   (loads .env.local). Skips if users already exist.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  if (await db.collection('users').countDocuments()) { console.log('Database already has users. Skipping seed.'); return process.exit(0); }
  const now = new Date();
  const passwordHash = await bcrypt.hash('Password123!', 12);
  const mk = (name, email, role) => ({ name, email, role, passwordHash, createdAt: now, updatedAt: now });
  const ids = (await db.collection('users').insertMany([
    mk('Admin User', 'admin@example.com', 'admin'),
    mk('Rita Recruiter', 'recruiter@example.com', 'recruiter'),
    mk('Carl Candidate', 'candidate@example.com', 'candidate'),
  ])).insertedIds;
  const admin = ids[0], recruiter = ids[1];
  const art = (title, category, body, author = admin) => ({
    title, category, body, author, status: 'published', views: 0, createdAt: now, updatedAt: now,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-seed',
  });
  await db.collection('articles').insertMany([
    art('How to create your candidate profile', 'profile', 'Select Register, enter your name, email and a password.\nAdd your skills and work history. A complete profile helps us match you to the right jobs.'),
    art('How to upload your CV', 'cv', 'Open My profile and choose Upload CV.\nUse a PDF or Word file smaller than 5 MB.'),
    art('How to apply for a job', 'apply', 'Search for a vacancy, open it and choose Apply. Track the status under My applications.'),
    art('Prepare for your first interview', 'interview', 'Research the company, practise answers aloud, plan your travel and arrive 15 minutes early.'),
    art('Reset a forgotten password', 'password', 'Choose Forgot password on the login page, enter your email and follow the link we send you.'),
    art('Post a vacancy as a recruiter', 'recruiter', 'Go to Jobs, complete the vacancy form and choose Publish vacancy.', recruiter),
    art('Is the platform free to use?', 'faq', 'Yes. Candidates never pay to register, apply or upload a CV.'),
  ]);
  await db.collection('jobs').insertOne({ title: 'Junior Web Developer', company: 'Example Tech', location: 'Cape Town', description: 'Build and maintain web applications with a friendly team.', status: 'open', recruiter, createdAt: now, updatedAt: now });
  console.log('Seeded. Password for all accounts: Password123!  (admin@example.com, recruiter@example.com, candidate@example.com)');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
