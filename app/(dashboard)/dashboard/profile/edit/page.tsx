// app/(dashboard)/dashboard/profile/edit/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/lib/sanity/utils';
import ProfileEditForm from '@/components/profiles/ProfileEditForm';

export default async function EditProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get the user's Sanity profile
  const user = await getUserByClerkId(userId);
  
  if (!user) {
    redirect('/dashboard');
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center">
            <span className="mr-3 rounded-md bg-gradient-to-br from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-md shadow-amber-500/20">
              FUT 25
            </span>
            <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Edit Profile
            </h1>
          </div>
          <p className="text-amber-400">
            Update your player information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black">
            Profile Details
          </div>
          <div className="p-6">
            <ProfileEditForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}