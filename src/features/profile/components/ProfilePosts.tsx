import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPosts } from "../../../api/userApi";
import { ProfilePostCard } from "./ProfilePostCard";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { GelButton } from "../../../components/ui/GelButton";

interface ProfilePostsProps {
    username: string;
}

export default function ProfilePosts({ username }: ProfilePostsProps) {
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ["userPosts", username],
        queryFn: ({ pageParam }) => getUserPosts(username, pageParam as string | undefined, 20),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (status === "pending") {
        return (
            <div className="flex flex-col gap-4 animate-pulse relative z-10 p-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 bg-white/40 backdrop-blur-md rounded-2xl"></div>
                ))}
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="p-8 text-center bg-white/40 backdrop-blur-md rounded-3xl mt-4 relative z-10 border border-white/40 shadow-aero">
                <p className="text-red-500 font-bold mb-4 text-xl">Could not load posts.</p>
                <GelButton variant="green" onClick={() => refetch()}>
                    Try Again
                </GelButton>
            </div>
        );
    }

    const posts = data?.pages.flatMap(page => page.items) || [];

    if (posts.length === 0) {
        return (
            <div className="p-16 text-center bg-white/40 backdrop-blur-md rounded-3xl mt-4 relative z-10 border border-white/40 shadow-aero flex flex-col items-center justify-center">
                <div className="text-6xl mb-4 opacity-50">🍃</div>
                <h3 className="aero-heading text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">No posts yet</h3>
                <p className="text-aero-blue font-bold">This user hasn't posted anything.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col relative z-10">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 p-4">
                {posts.map(post => (
                    <ProfilePostCard key={post.id} post={post} />
                ))}
            </div>

            {hasNextPage && (
                <div ref={ref} className="p-6 text-center flex justify-center">
                    {isFetchingNextPage ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-aero-blue animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-4 h-4 rounded-full bg-aero-cyan animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-4 h-4 rounded-full bg-aero-green animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                    ) : (
                        <div className="h-8"></div>
                    )}
                </div>
            )}
        </div>
    );
}
