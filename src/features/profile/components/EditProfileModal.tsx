import { useState, useEffect } from "react";
import { AeroModal } from "../../../components/ui/AeroModal";
import { GelButton } from "../../../components/ui/GelButton";
import { AeroInput } from "../../../components/ui/AeroInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, type UpdateProfilePayload } from "../../../api/userApi";
import type { UserProfileResponse } from "../types/profileTypes";

interface EditProfileModalProps {
    profile: UserProfileResponse;
    open: boolean;
    onClose: () => void;
}

export function EditProfileModal({ profile, open, onClose }: EditProfileModalProps) {
    const [name, setName] = useState(profile.displayName);
    const [bio, setBio] = useState(profile.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
    const [error, setError] = useState<string | null>(null);

    const queryClient = useQueryClient();

    useEffect(() => {
        if (open) {
            setName(profile.displayName);
            setBio(profile.bio || "");
            setAvatarUrl(profile.avatarUrl || "");
            setError(null);
        }
    }, [open, profile]);

    const updateMutation = useMutation({
        mutationFn: (payload: UpdateProfilePayload) => updateUserProfile(payload),
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(["userProfile", updatedProfile.username], updatedProfile);
            onClose();
        },
        onError: () => {
            setError("Failed to update profile. Please check your inputs and try again.");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        updateMutation.mutate({
            name: name.trim(),
            bio: bio.trim() || undefined,
            avatarUrl: avatarUrl.trim() || undefined
        });
    };

    return (
        <AeroModal title="Edit Profile" open={open} onClose={onClose}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="p-3 rounded-xl bg-rose-100/80 border border-rose-300 text-rose-800 text-sm font-semibold text-center">
                        {error}
                    </div>
                )}

                <div>
                    <AeroInput
                        id="name"
                        label="Display Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={updateMutation.isPending}
                        placeholder="Your public display name"
                        className="w-full"
                        maxLength={50}
                    />
                </div>

                <div>
                    <label htmlFor="bio" className="block text-sm font-bold text-sky-950 mb-1 ml-1">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={updateMutation.isPending}
                        placeholder="Tell us a bit about yourself..."
                        className="aero-input w-full min-h-[100px] resize-y"
                        maxLength={160}
                    />
                    <p className="text-right text-xs text-sky-900/60 mt-1 font-semibold">
                        {bio.length}/160
                    </p>
                </div>

                <div>
                    <AeroInput
                        id="avatarUrl"
                        label="Avatar URL (Optional)"
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        disabled={updateMutation.isPending}
                        placeholder="https://example.com/avatar.png"
                        className="w-full"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <GelButton
                        variant="orange"
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-sm"
                        disabled={updateMutation.isPending}
                    >
                        Cancel
                    </GelButton>
                    <GelButton
                        variant="cyan"
                        type="submit"
                        disabled={updateMutation.isPending || !name.trim()}
                        className="px-6 py-2"
                    >
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </GelButton>
                </div>
            </form>
        </AeroModal>
    );
}
