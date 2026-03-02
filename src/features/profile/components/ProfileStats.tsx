import type { UserProfileResponse } from "../types/profileTypes";

interface ProfileStatsProps {
    profile: UserProfileResponse;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
    // Placeholder stats for the aesthetic. In a real app, these come from backend
    const stats = [
        { label: "Posts", value: profile.postsCount || 0 },
        { label: "Following", value: 120 }, // Simulated
        { label: "Followers", value: 432 }  // Simulated
    ];

    return (
        <div className="w-full max-w-4xl mx-auto flex justify-center gap-4 md:gap-8 mb-8 relative z-10 px-4">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="flex-1 max-w-[120px] md:max-w-[180px] bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-4 text-center shadow-aero group hover:bg-white/50 transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="text-2xl md:text-3xl font-black text-violet-700 drop-shadow-sm group-hover:drop-shadow-md">
                        {stat.value}
                    </div>
                    <div className="text-xs md:text-sm font-bold text-sky-950 uppercase tracking-widest mt-1 opacity-80">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
