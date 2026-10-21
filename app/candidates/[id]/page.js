import Link from 'next/link';
import mongoose from 'mongoose';
import { notFound } from 'next/navigation';
import { connect } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { canViewProfile } from '@/lib/access';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Document from '@/models/Document';
import ProfileView from '@/components/ProfileView';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function CandidatePage({ params }) {
  const me = await getUser();
  if (!me) return <p className="note">Please <Link href="/login">log in</Link> to view profiles.</p>;
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await connect();
  const [u, p] = await Promise.all([User.findById(params.id).lean(), Profile.findOne({ user: params.id }).lean()]);
  if (!u || !p) return <p className="note">This candidate has not created a profile yet.</p>;
  if (!(await canViewProfile(me, p))) return <p className="note">This profile is private.</p>;
  const docs = await Document.find({ owner: params.id }).select('-data').sort({ createdAt: -1 }).lean();
  return (
    <>
      <div className="row noprint" style={{ margin: '20px 0' }}>
        <Link href={me.role === 'candidate' ? '/profile' : '/candidates'} className="link">&larr; Back</Link><PrintButton />
      </div>
      <ProfileView name={u.name} email={u.email} p={p} docs={docs} />
    </>
  );
}
