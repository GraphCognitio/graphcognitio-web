import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../../../api/userApi";
import ProfileHeader from "../components/ProfileHeader";
import ProfileStats from "../components/ProfileStats";
import ProfilePosts from "../components/ProfilePosts";
import { AppShell } from "../../../components/layout/AppShell";
import { useAuth } from "../../auth/hooks/useAuth";

export default function UserProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { user } = useAuth();

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ["userProfile", username],
        queryFn: () => getUserProfile(username!),
        enabled: !!username,
        retry: 1
    });

    const isCurrentUser = user?.username === username;

    if (isLoading) {
        return (
            <AppShell contentClassName="max-w-4xl w-full mx-auto p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-aero-blue animate-bounce"></div>
                    <div className="w-6 h-6 rounded-full bg-aero-cyan animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-6 h-6 rounded-full bg-aero-green animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </AppShell>
        );
    }

    if (isError || !profile) {
        return (
            <AppShell contentClassName="max-w-2xl w-full mx-auto p-4 md:p-8 mt-12 text-center bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-aero-lg">
                <div className="p-12">
                    <div className="text-8xl mb-6 drop-shadow-md opacity-80">🧐</div>
                    <h1 className="aero-heading text-4xl font-black mb-4">User Not Found</h1>
                    <p className="text-lg text-gray-700 italic font-medium mb-8">
                        The profile you are looking for does not exist or has been removed.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="aero-pill aero-focus-ring px-8 py-3 rounded-full font-bold text-sky-900 shadow-aero hover:-translate-y-1 transition text-lg bg-white/70 hover:bg-white"
                    >
                        Go Back
                    </button>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell contentClassName="w-full max-w-4xl mx-auto px-4 md:px-0 mt-8 mb-24 relative z-10 flex flex-col justify-start pb-20">
            {/* Decorative Aero background elements wrapper */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-aero-blue/20 to-transparent pointer-events-none z-0"></div>
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-aero-cyan/20 to-aero-green/30 blur-3xl opacity-50 pointer-events-none z-0 animate-pulse-slow mix-blend-overlay"></div>
            </div>

            <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />
            <ProfileStats profile={profile} />

            <div className="mt-8 mb-4 sticky top-[72px] z-30 pt-4 pb-2 bg-gradient-to-b from-[#e0f0f4] via-[#e0f0f4]/95 to-transparent backdrop-blur-sm -mx-4 px-4 border-b border-white/40">
                <h2 className="aero-heading text-xl md:text-2xl font-black text-sky-950 inline-block drop-shadow-sm">
                    Posts by {profile.displayName}
                </h2>
            </div>

            <ProfilePosts username={profile.username} />
        </AppShell>
    );
}
