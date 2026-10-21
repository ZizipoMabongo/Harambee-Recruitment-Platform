import Link from 'next/link';
import { connect } from '@/lib/db';
import User from '@/models/User';
import Job from '@/models/Job';
import { CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export default async function Landing() {
  await connect();
  const [candidates, recruiters, openJobs, jobs] = await Promise.all([
    User.countDocuments({ role: 'candidate' }), User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments({ status: 'open' }), Job.find({ status: 'open' }).sort({ createdAt: -1 }).limit(3).lean(),
  ]);
  return (
    <>
      <section className="lp-hero">
        <div>
          <span className="badge">Harambee means &ldquo;pull together&rdquo;</span>
          <h1>Your next move <span className="grad-text">starts here.</span></h1>
          <p className="lead">Build a profile that speaks for you, upload your CV and documents once, and get seen by recruiters who are hiring right now.</p>
          <div className="row-gap"><Link href="/login?mode=register" className="btn big">Create your profile</Link><Link href="/jobs" className="btn alt big">Browse jobs</Link></div>
          <p className="meta">Free for candidates. You control who sees your profile.</p>
        </div>
        <img src="/hero-candidates.svg" alt="Illustration of a candidate profile card with skills and a job match" className="hero-img" />
      </section>

      <section className="stats">
        <div><b>{openJobs}</b><span>open vacancies</span></div>
        <div><b>{candidates}</b><span>candidate profiles</span></div>
        <div><b>{recruiters}</b><span>recruiters hiring</span></div>
      </section>

      <section className="sec">
        <h2>Three steps to get hired</h2>
        <div className="grid3">
          {[['01', 'Build your profile', 'Add your skills, experience and education. Our CV page is generated from it, ready to print or save as PDF.'],
            ['02', 'Upload your documents', 'Keep your CV, certificates and ID in one secure place. PDF and Word files are supported.'],
            ['03', 'Apply and track', 'Apply in one click and watch your application move from shortlisted to interview to offer.']].map(([n, t, d]) => (
            <div key={n} className="feat"><span className="num">{n}</span><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="row"><h2>Fresh vacancies</h2><Link href="/jobs" className="link">See all jobs</Link></div>
        <div className="grid3">
          {jobs.map((j) => (
            <Link key={String(j._id)} href="/jobs" className="feat job"><span className="pill">{j.location}</span><h3>{j.title}</h3><p className="meta">{j.company}</p></Link>
          ))}
          {!jobs.length && <p className="note">No vacancies yet. Recruiters can post the first one.</p>}
        </div>
      </section>

      <section className="band">
        <div><h2>Hiring? Meet your next star.</h2><p>Browse consented candidate profiles, read their CVs and move applicants through your pipeline.</p></div>
        <Link href="/recruiters" className="btn big">For recruiters</Link>
      </section>

      <section className="sec">
        <h2>Need a hand? Our help centre has you.</h2>
        <div className="chips">{CATEGORIES.map((c) => <Link key={c.id} className="chip" href={`/articles?category=${c.id}`}>{c.name}</Link>)}</div>
      </section>
    </>
  );
}
