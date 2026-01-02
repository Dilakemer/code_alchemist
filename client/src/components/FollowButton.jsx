import React, { useState } from 'react';

const FollowButton = ({ userId, initialIsFollowing, onFollowChange, apiBase, authHeaders, onShowAlert }) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (loading) return;

        // Check if user is logged in (authHeaders will be empty or not have Authorization if not logged in)
        if (!authHeaders || !authHeaders.Authorization) {
            if (onShowAlert) onShowAlert('Please log in first');
            else alert('Please log in to follow the user.');
            return;
        }

        setLoading(true);

        try {
            const method = isFollowing ? 'DELETE' : 'POST';
            const res = await fetch(`${apiBase}/api/users/${userId}/follow`, {
                method,
                headers: { 'Content-Type': 'application/json', ...authHeaders }
            });

            if (res.ok) {
                const newStatus = !isFollowing;
                setIsFollowing(newStatus);
                if (onFollowChange) {
                    onFollowChange(newStatus);
                }
            } else {
                const data = await res.json();
                console.error('Follow error:', data.error);
            }
        } catch (err) {
            console.error('Follow request failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isFollowing
                ? 'bg-gray-700 text-gray-300 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/50 border border-gray-600'
                : 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 border border-fuchsia-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? (
                <span className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </span>
            ) : isFollowing ? (
                <span className="group-hover:hidden">Following</span>
            ) : (
                'Follow'
            )}
        </button>
    );
};

export default FollowButton;
