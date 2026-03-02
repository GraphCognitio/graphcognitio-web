import { useState } from "react";
import type { UserProfileResponse } from "../types/profileTypes";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileHeaderProps {
    profile: UserProfileResponse;
    isCurrentUser: boolean;
}

export default function ProfileHeader({ profile, isCurrentUser }: ProfileHeaderProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const joinedDate = new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 mt-4 relative z-10">
            {/* Avatar Container with Glow */}
            <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-tr from-aero-blue via-aero-cyan to-aero-green rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse-slow"></div>
                {profile.avatarUrl ? (
                    <img
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-aero z-10"
                    />
                ) : (
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-md border border-white/40 shadow-aero z-10 flex text-center items-center justify-center">
                        <span className="text-aero-blue drop-shadow-md text-5xl font-black uppercase tracking-tighter">
                            {profile.displayName.substring(0, 1)}
                        </span>
                    </div>
                )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left w-full">
                <div className="flex flex-col md:flex-row md:justify-between w-full items-center md:items-start gap-4 mb-4">
                    <div>
                        <h1 className="aero-heading text-3xl md:text-4xl font-black text-white drop-shadow-md mb-1">
                            {profile.displayName}
                        </h1>
                        <p className="text-violet-700 font-extrabold text-lg drop-shadow-sm flex items-center justify-center md:justify-start gap-1">
                            @{profile.username}
                        </p>
                    </div>
                </div>

                {profile.bio && (
                    <p className="text-sky-950 mb-4 max-w-xl text-lg bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-aero-inner font-medium break-words whitespace-pre-wrap">
                        {profile.bio}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-start w-full mt-auto gap-4">
                    {/* Edit Profile Button (only if current user) */}
                    {isCurrentUser && (
                        <div className="shrink-0">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="relative overflow-hidden rounded-full border border-white/90 bg-gradient-to-b from-violet-500 to-purple-700 px-6 py-2 text-sm font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)] shadow-[0_6px_12px_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.9),inset_0_-2px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:scale-[1.05] hover:shadow-[0_8px_16px_rgba(167,139,250,0.6),0_0_15px_rgba(142,197,252,0.6),inset_0_2px_0_rgba(255,255,255,1)] aero-focus-ring"
                            >
                                <span className="absolute inset-x-0.5 top-0.5 h-[45%] rounded-[999px_999px_200px_200px/999px] bg-gradient-to-b from-white/95 to-white/10 pointer-events-none" />
                                <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(255,255,255,1)] tracking-wide">
                                    Edit Profile
                                </span>
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-sky-900 font-bold opacity-90 text-right shrink-0">
                        <svg className="w-5 h-5 flex-shrink-0 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Joined {joinedDate}
                    </div>
                </div>
            </div>

            {isCurrentUser && (
                <EditProfileModal
                    profile={profile}
                    open={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
}
