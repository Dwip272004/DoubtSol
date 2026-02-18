import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, GraduationCap, BookOpen, Star, ShieldCheck, Edit2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    const isTutor = profile.role === 'tutor'

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar and Basic Info */}
                <div className="card w-full md:w-80 flex flex-col items-center text-center p-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            getInitials(profile.name)
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
                    <div className="flex items-center gap-1.5 text-white/40 text-sm mb-4">
                        <span className="capitalize">{profile.role}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {profile.rating.toFixed(1)} ({profile.total_reviews} reviews)
                        </span>
                    </div>

                    <button className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                        <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                </div>

                {/* Detailed Info */}
                <div className="flex-1 space-y-6 w-full">
                    <div className="card space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-brand-400" /> Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-white/40 mb-1">Full Name</label>
                                <p className="text-white bg-white/5 px-4 py-2.5 rounded-lg border border-white/5">{profile.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/40 mb-1">Email Address</label>
                                <div className="flex items-center gap-2 text-white bg-white/5 px-4 py-2.5 rounded-lg border border-white/5 overflow-hidden">
                                    <Mail className="w-4 h-4 text-white/30" />
                                    <span className="truncate">{profile.email}</span>
                                </div>
                            </div>
                        </div>

                        {isTutor && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-white/40 mb-1">Bio</label>
                                    <p className="text-white/70 bg-white/5 px-4 py-3 rounded-lg border border-white/5 leading-relaxed min-h-[100px]">
                                        {profile.bio || "No bio provided yet."}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/40 mb-3">Expertise Subjects</label>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.subjects && profile.subjects.length > 0 ? (
                                            profile.subjects.map((subject: string) => (
                                                <span key={subject} className="badge bg-brand-500/10 text-brand-400 border-brand-500/20 px-4 py-1.5 text-sm">
                                                    {subject}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-white/30 text-sm">No subjects added yet.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Verification Status */}
                    <div className="card flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", profile.is_verified ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-500")}>
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Identity Verification</h3>
                                <p className="text-white/40 text-sm">
                                    {profile.is_verified ? "Your profile is verified. You can accept doubts." : "Complete verification to start earning as a tutor."}
                                </p>
                            </div>
                        </div>
                        {!profile.is_verified && (
                            <button className="btn-primary text-sm px-4 py-2">Get Verified</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
