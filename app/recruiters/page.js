import Link from 'next/link';

export const metadata = { title: 'Hire with Harambee | For recruiters' };

export default function Recruiters() {
  return (
    <>
      <section className="lp-hero alt">
        <div>
          <span className="badge">For recruiters and employers</span>
          <h1>Find talent that is <span className="grad-text">ready to work.</span></h1>
          <p className="lead">Search real candidate profiles, read their CVs, open their documents and manage every application in one pipeline.</p>
          <div className="row-gap"><Link href="/login?mode=register&role=recruiter" className="btn big">Start hiring</Link><Link href="/jobs" className="btn alt big">See live vacancies</Link></div>
        </div>
        <img src="/hero-recruiters.svg" alt="Illustration of a hiring pipeline with candidate cards" className="hero-img" />
      </section>
      <section className="sec">
        <h2>Everything you need to hire</h2>
        <div className="grid3">
          {[['Talent search', 'Search profiles by skill, job title or location. Only candidates who chose to be visible appear.'],
            ['Complete candidate view', 'Experience, education and a printable CV on one page, plus the documents candidates uploaded.'],
            ['Simple pipeline', 'Move applicants from applied to shortlisted, interview, offer or rejected with one click.'],
            ['Post vacancies fast', 'Publish a role in under a minute and start receiving applications.'],
            ['Privacy built in', 'Candidates control their visibility. You only see documents of people who shared or applied.'],
            ['Help when you need it', 'Recruiter guides in our help centre cover posting, shortlisting and interviews.']].map(([t, d]) => (
            <div key={t} className="feat"><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>
      <section className="band">
        <div><h2>Ready to meet your next hire?</h2><p>Create a recruiter account and post your first vacancy today.</p></div>
        <Link href="/login?mode=register&role=recruiter" className="btn big">Create recruiter account</Link>
      </section>
    </>
  );
}
