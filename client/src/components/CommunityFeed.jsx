import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';

const CommunityFeed = ({ apiBase, authHeaders, onSelect, onRefresh, endpoint, user, onUserClick, onShowAlert }) => {
    const isMyPosts = endpoint && endpoint.includes('my-posts');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            const url = endpoint ? `${apiBase}${endpoint}` : `${apiBase}/api/community/feed`;
            const res = await fetch(url, { headers: authHeaders });
            const data = await res.json();
            setPosts(data.feed || data.posts || []);
        } catch (err) {
            console.error("Feed fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    // Expose refresh to parent if needed, or just auto-refresh on mount
    useEffect(() => {
        if (onRefresh) onRefresh(fetchFeed);
    }, [onRefresh]);

    const handleLike = async (id) => {
        try {
            const res = await fetch(`${apiBase}/api/history/${id}/like`, {
                method: 'POST',
                headers: authHeaders
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.likes, user_has_liked: data.status === 'liked' } : p));
                return data;
            }
        } catch (err) {
            console.error("Like error:", err);
            throw err;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                        {isMyPosts ? 'My Community Posts' : 'Community Feed'}
                    </h2>
                    {/* Filter or Sort buttons could go here */}
                </div>

                {posts.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        {isMyPosts
                            ? 'No posts yet. Start sharing something! 🚀'
                            : 'No posts yet. Be the first to share!'}
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onLike={handleLike}
                            onSelect={onSelect}
                            apiBase={apiBase}
                            user={user}
                            authHeaders={authHeaders}
                            onUserClick={onUserClick}
                            onDelete={(deletedId) => {
                                setPosts(prev => prev.filter(p => p.id !== deletedId));
                            }}
                            onEdit={(updatedPost) => {
                                setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                            }}
                            onShowAlert={onShowAlert}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default CommunityFeed;
