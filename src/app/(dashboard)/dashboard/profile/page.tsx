import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileForms from "./ProfileForms";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const user = await prisma.users.findUnique({
    where: { id: BigInt(session.user.id) }
  });

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-4xl shadow-inner border-4 border-teal-50">
            {user.fullname.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{user.fullname}</h1>
            <p className="text-slate-500">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              {user.status === 1 ? "Supplier Gas" : "Agen Gas"}
            </span>
          </div>
        </div>

        <ProfileForms user={{
          fullname: user.fullname,
          email: user.email,
          nomorTelepon: user.nomorTelepon,
          alamat: user.alamat,
        }} />
      </div>
    </div>
  );
}
