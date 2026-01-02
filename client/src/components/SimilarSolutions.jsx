import React, { useState, useEffect } from 'react';

const SimilarSolutions = ({
  historyId,
  userQuestion,
  apiBase,
  authHeaders,
  user,
  onAuthRequired,
  onSelectPost
}) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchSimilar = async () => {
    if (!historyId) return;
    setLoading(true);
    setHasSearched(false);
    try {
      const res = await fetch(`${apiBase}/api/history/${historyId}/similar`);
      const json = await res.json();
      setSimilar(json.similar || []);
      setHasSearched(true);
    } catch (err) {
      console.error("Failed to fetch similar questions", err);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimilar();
  }, [historyId, apiBase]);

  const handleLike = async (e, postId) => {
    e.stopPropagation(); // Prevent triggering onSelectPost
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/history/${postId}/like`, {
        method: 'POST',
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state
        setSimilar(prev => prev.map(p =>
          p.id === postId ? { ...p, likes: data.likes } : p
        ));
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Hiç benzer soru yoksa hiçbir şey gösterme
  if (!loading && hasSearched && similar.length === 0) {
    return (
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">Benzer topluluk sorusu bulunamadı.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
          <span className="text-sm">Benzer sorular aranıyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-fuchsia-200">Benzer Topluluk Soruları</h3>
        <span className="text-xs text-gray-400">{similar.length} sonuç</span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {similar.map(post => (
          <div
            key={post.id}
            onClick={() => onSelectPost && onSelectPost(post)}
            className="bg-black/40 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-fuchsia-500/50 hover:bg-gray-800/50 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">
                  {post.user_question}
                </h4>
                {post.summary && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {post.summary}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <button
                  onClick={(e) => handleLike(e, post.id)}
                  className="text-[10px] bg-gray-700/50 px-2 py-1 rounded text-gray-400 hover:bg-violet-700/60 hover:text-white transition-colors flex items-center gap-1"
                >
                  👍 {post.likes || 0}
                </button>
                {post.answer_count > 0 && (
                  <span className="text-[10px] bg-indigo-900/30 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/30">
                    {post.answer_count} Çözüm
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
              <span>{post.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarSolutions;

