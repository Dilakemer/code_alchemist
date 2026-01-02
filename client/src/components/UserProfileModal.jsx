import React, { useState, useEffect, useRef } from 'react';
import FollowButton from './FollowButton';

const UserProfileModal = ({ userId, onClose, apiBase, authHeaders, currentUser, onPostClick, onLogout, onUserUpdate, onShowAlert, onUserClick, onBack, canGoBack }) => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [imageLoading, setImageLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Followers/Following list states
    const [activeListTab, setActiveListTab] = useState(null); // 'followers' | 'following' | null
    const [followersList, setFollowersList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    const isOwnProfile = currentUser && currentUser.id === userId;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${apiBase}/api/users/${userId}/profile`, { headers: authHeaders });
                if (res.ok) {
                    const data = await res.json();
                    setProfileData(data); // { user: {...}, posts: [...] }
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) {
            // Reset states when user changes
            // Only reset if NOT navigating back? Actually we want to reset UI states (like settings open) but show new user data
            setActiveListTab(null);
            setShowSettings(false);
            setMessage({ type: '', text: '' });
            setFollowersList([]);
            setFollowingList([]);
            setLoading(true); // Ensure loading state is true when switching
            fetchProfile();
        }
    }, [userId, apiBase, authHeaders]);

    if (!userId) return null;

    const user = profileData?.user;
    const posts = profileData?.posts || [];

    const resolveAvatarUrl = (u) => {
        if (!u) return null;
        const candidate = u.profile_image || u.profile_image_url || u.profileImage || u.avatar || u.author_image;
        if (!candidate) return null;
        // Eğer zaten tam URL ise direkt döndür
        if (candidate.startsWith('http://') || candidate.startsWith('https://')) return candidate;
        // Eğer /uploads/ ile başlıyorsa apiBase ile birleştir
        if (candidate.startsWith('/uploads/') || candidate.startsWith('/uploads')) {
            return `${apiBase}${candidate}`;
        }
        // Eğer uploads/ ile başlıyorsa (slash yok) ekle
        if (candidate.startsWith('uploads/')) {
            return `${apiBase}/${candidate}`;
        }
        // Diğer durumlarda başına / ekle
        return `${apiBase}${candidate.startsWith('/') ? '' : '/'}${candidate}`;
    };

    const avatarUrl = resolveAvatarUrl(user);
    const bioRaw = user?.bio || user?.description || user?.about || '';
    const bio = bioRaw && !/okunaksız/i.test(bioRaw) ? bioRaw : '';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative">
                {canGoBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 text-gray-400 hover:text-white z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all"
                        title="Geri Dön"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : user ? (
                    <>
                        {/* Profile Header */}
                        <div className="flex flex-col items-center p-6 border-b border-gray-800">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 p-1 mb-4">
                                <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={user.display_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : null}
                                    <span
                                        className="text-3xl font-bold text-white uppercase"
                                        style={{ display: avatarUrl ? 'none' : 'block' }}
                                    >
                                        {user.display_name?.[0]}
                                    </span>
                                </div>
                            </div>

                            {bio && (
                                <p className="text-sm text-gray-400 text-center mb-2 px-4">
                                    {bio}
                                </p>
                            )}

                            <h2 className="text-xl font-bold text-white mb-1">{user.display_name}</h2>
                            <p className="text-gray-400 text-sm mb-4">Member since: {user.created_at}</p>

                            <div className="flex gap-6 mb-4">
                                <button
                                    onClick={async () => {
                                        setActiveListTab('followers');
                                        setListLoading(true);
                                        try {
                                            const res = await fetch(`${apiBase}/api/users/${userId}/followers`, { headers: authHeaders });
                                            if (res.ok) {
                                                const data = await res.json();
                                                setFollowersList(data.followers || []);
                                                setProfileData(prev => ({
                                                    ...prev,
                                                    user: {
                                                        ...prev.user,
                                                        followers_count: (data.followers || []).length
                                                    }
                                                }));
                                            }
                                        } catch (err) {
                                            console.error('Failed to fetch followers', err);
                                        } finally {
                                            setListLoading(false);
                                        }
                                    }}
                                    className="text-center hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <div className="text-lg font-bold text-white">{user.followers_count || 0}</div>
                                    <div className="text-xs text-gray-500">Followers</div>
                                </button>
                                <button
                                    onClick={async () => {
                                        setActiveListTab('following');
                                        setListLoading(true);
                                        try {
                                            const res = await fetch(`${apiBase}/api/users/${userId}/following`, { headers: authHeaders });
                                            if (res.ok) {
                                                const data = await res.json();
                                                setFollowingList(data.following || []);
                                                setProfileData(prev => ({
                                                    ...prev,
                                                    user: {
                                                        ...prev.user,
                                                        following_count: (data.following || []).length
                                                    }
                                                }));
                                            }
                                        } catch (err) {
                                            console.error('Failed to fetch following', err);
                                        } finally {
                                            setListLoading(false);
                                        }
                                    }}
                                    className="text-center hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <div className="text-lg font-bold text-white">{user.following_count || 0}</div>
                                    <div className="text-xs text-gray-500">Following</div>
                                </button>
                                <div className="text-center px-3 py-2">
                                    <div className="text-lg font-bold text-white">{posts.length}</div>
                                    <div className="text-xs text-gray-500">Posts</div>
                                </div>
                            </div>

                            {/* Follow Button */}
                            {currentUser && currentUser.id !== userId && (
                                <FollowButton
                                    userId={userId}
                                    initialIsFollowing={user.is_following}
                                    apiBase={apiBase}
                                    authHeaders={authHeaders}
                                    onFollowChange={(newStatus) => {
                                        setProfileData(prev => ({
                                            ...prev,
                                            user: {
                                                ...prev.user,
                                                is_following: newStatus,
                                                followers_count: (prev.user.followers_count || 0) + (newStatus ? 1 : -1)
                                            }
                                        }));
                                    }}
                                    onShowAlert={onShowAlert}
                                />
                            )}

                            {/* Settings Button for own profile */}
                            {isOwnProfile && (
                                <button
                                    onClick={() => {
                                        setShowSettings(!showSettings);
                                        setDisplayName(user.display_name || '');
                                    }}
                                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {showSettings ? 'Back' : 'Settings'}
                                </button>
                            )}
                        </div>

                        {/* Followers/Following List Modal */}
                        {activeListTab && (
                            <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col">
                                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setActiveListTab('followers')}
                                            className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${activeListTab === 'followers' ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Followers ({user.followers_count || 0})
                                        </button>
                                        <button
                                            onClick={() => setActiveListTab('following')}
                                            className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${activeListTab === 'following' ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Following ({user.following_count || 0})
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setActiveListTab(null)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    {listLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {(activeListTab === 'followers' ? followersList : followingList).map((u) => {
                                                const avatarUrl = resolveAvatarUrl(u);
                                                return (
                                                    <div
                                                        key={u.id}
                                                        onClick={() => onUserClick && onUserClick(u.id)}
                                                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-sm font-bold overflow-hidden border border-gray-700">
                                                            {avatarUrl ? (
                                                                <img
                                                                    src={avatarUrl}
                                                                    alt={u.display_name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentElement.innerText = u.display_name?.[0]?.toUpperCase() || '?';
                                                                    }}
                                                                />
                                                            ) : (
                                                                u.display_name?.[0]?.toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-white font-medium text-sm">{u.display_name}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {(activeListTab === 'followers' ? followersList : followingList).length === 0 && (
                                                <div className="text-center text-gray-500 py-8 text-sm">
                                                    {activeListTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Settings Panel */}
                        {showSettings && isOwnProfile ? (
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <h3 className="text-lg font-bold text-white mb-4">Profile Settings</h3>

                                {message.text && (
                                    <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
                                        {message.text}
                                    </div>
                                )}

                                {/* Profile Picture */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Profile Picture</label>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setImageLoading(true);
                                        const formData = new FormData();
                                        formData.append('image', file);
                                        try {
                                            const res = await fetch(`${apiBase}/api/auth/profile/image`, { method: 'POST', headers: authHeaders, body: formData });
                                            const data = await res.json();
                                            if (res.ok) {
                                                setMessage({ type: 'success', text: 'Photo updated!' });
                                                if (onUserUpdate) onUserUpdate(data.user);
                                            } else {
                                                setMessage({ type: 'error', text: data.error || 'Error occurred.' });
                                            }
                                        } catch { setMessage({ type: 'error', text: 'Connection error.' }); }
                                        finally { setImageLoading(false); }
                                    }} />
                                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors">
                                        {imageLoading ? 'Uploading...' : 'Change Photo'}
                                    </button>
                                </div>

                                {/* Display Name */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none" />
                                </div>

                                {/* Password Change */}
                                <div className="space-y-3">
                                    <label className="block text-sm text-gray-400">Change Password</label>
                                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none" />
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none" />
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none" />
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={async () => {
                                        if (newPassword && newPassword !== confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match.' }); return; }
                                        setUpdating(true);
                                        try {
                                            const res = await fetch(`${apiBase}/api/auth/profile`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json', ...authHeaders },
                                                body: JSON.stringify({ display_name: displayName, current_password: currentPassword, new_password: newPassword })
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                setMessage({ type: 'success', text: 'Profile updated!' });
                                                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                                                if (onUserUpdate) onUserUpdate(data.user);
                                            } else { setMessage({ type: 'error', text: data.error || 'Error occurred.' }); }
                                        } catch { setMessage({ type: 'error', text: 'Connection error.' }); }
                                        finally { setUpdating(false); }
                                    }}
                                    disabled={updating}
                                    className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
                                >
                                    {updating ? 'Saving...' : 'Save Changes'}
                                </button>

                                {/* Delete Account */}
                                <div className="pt-6 border-t border-gray-800">
                                    <h4 className="text-red-400 font-bold mb-2">Danger Zone</h4>
                                    {!showDeleteConfirm ? (
                                        <button onClick={() => setShowDeleteConfirm(true)} className="text-red-400 hover:text-red-300 text-sm underline">
                                            Delete My Account
                                        </button>
                                    ) : (
                                        <div className="space-y-3 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                            <p className="text-sm text-red-300">This action cannot be undone! Enter your password to confirm:</p>
                                            <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your Password" className="w-full bg-gray-800 border border-red-500/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none" />
                                            <div className="flex gap-2">
                                                <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Cancel</button>
                                                <button
                                                    onClick={async () => {
                                                        if (!deletePassword) return;
                                                        try {
                                                            const res = await fetch(`${apiBase}/api/auth/delete-account`, {
                                                                method: 'DELETE',
                                                                headers: { 'Content-Type': 'application/json', ...authHeaders },
                                                                body: JSON.stringify({ password: deletePassword })
                                                            });
                                                            if (res.ok) { if (onLogout) onLogout(); onClose(); }
                                                            else { const d = await res.json(); setMessage({ type: 'error', text: d.error || 'Could not delete.' }); }
                                                        } catch { setMessage({ type: 'error', text: 'Connection error.' }); }
                                                    }}
                                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-bold"
                                                >
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Posts Section */
                            <div className="flex-1 overflow-y-auto p-6">
                                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Posts
                                </h3>
                                {posts.length === 0 ? (
                                    <div className="text-center text-gray-500 text-sm py-8">
                                        No posts yet
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {posts.map((post) => (
                                            <div
                                                key={post.id}
                                                onClick={() => onPostClick && onPostClick(post)}
                                                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-fuchsia-500/50 transition-all cursor-pointer group"
                                            >
                                                <p className="text-sm text-white font-medium mb-2 line-clamp-2 group-hover:text-fuchsia-300 transition-colors">
                                                    {post.user_question || 'Untitled Post'}
                                                </p>
                                                {post.code_snippet && (
                                                    <div className="bg-gray-900 rounded p-2 mb-2 border border-gray-800">
                                                        <code className="text-xs text-gray-400 line-clamp-2 font-mono">
                                                            {post.code_snippet}
                                                        </code>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {new Date(post.timestamp).toLocaleDateString('en-US')}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-fuchsia-400">
                                                        ⚡ {post.selected_model}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-8 text-center text-gray-500">User not found</div>
                )}
            </div>
        </div>
    );
};

export default UserProfileModal;
