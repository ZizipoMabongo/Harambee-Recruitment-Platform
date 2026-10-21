import './globals.css';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { connect } from '@/lib/db';
import Notification from '@/models/Notification';
import ChatWidget from '@/components/ChatWidget';

export const metadata = { title: 'Harambee | Pull together. Get hired.', description: 'A recruitment platform connecting young talent with employers.' };
export const viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }) {
  const user = await getUser();
  const isStaff = user && user.role !== 'candidate';
  let unread = 0;
  if (user) { try { await connect(); unread = await Notification.countDocuments({ user: user.id, read: false }); } catch {} }
  return (
    <html lang="en">
      <body>
        <header className="top">
          <div className="wrap bar">
            <Link href="/" className="brand"><span className="mark">H</span>Harambee</Link>
            <nav>
              <Link href="/jobs">Jobs</Link>
              {!isStaff && <Link href="/recruiters">For recruiters</Link>}
              <Link href="/articles">Help centre</Link>
              {user?.role === 'candidate' && <Link href="/profile">My profile</Link>}
              {isStaff && <Link href="/candidates">Talent</Link>}
              {isStaff && <Link href="/dashboard">Dashboard</Link>}
              {isStaff && <Link href="/manage">Articles</Link>}
              {user && <Link href="/notifications">Alerts{unread > 0 && <span className="dot">{unread}</span>}</Link>}
              {user ? (
                <form action="/api/auth/logout" method="post"><span className="meta">{user.name}</span><button className="btn alt sm">Log out</button></form>
              ) : (<Link href="/login" className="btn sm">Log in</Link>)}
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="foot"><div className="wrap row"><span><b>Harambee</b>. Pull together. A student project, not affiliated with any existing organisation.</span><span className="meta"><Link href="/articles">Help centre</Link> · <Link href="/recruiters">Hire talent</Link></span></div></footer>
        <ChatWidget />
      </body>
    </html>
  );
}
