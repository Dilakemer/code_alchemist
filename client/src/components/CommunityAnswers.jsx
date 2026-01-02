import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const CommunityAnswers = ({
  historyId,
  user,
  onAuthRequired,
  apiBase,
  authHeaders,
  highlightAnswerId,
  onShowAlert
}) => {
  const [answers, setAnswers] = useState([]);
  const [body, setBody] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAnswers = async () => {
    if (!historyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/history/${historyId}/answers`);
      const json = await res.json();
      setAnswers(json.answers || []);
    } catch (err) {
      console.error("Failed to fetch answers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [historyId]);

  useEffect(() => {
    if (highlightAnswerId && answers.length > 0) {
      const el = document.getElementById(`answer-${highlightAnswerId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-fuchsia-500', 'bg-fuchsia-900/30');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-fuchsia-500', 'bg-fuchsia-900/30');
        }, 3000);
      }
    }
  }, [answers, highlightAnswerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!historyId || !body.trim()) return;
    if (!user) {
      onAuthRequired();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/history/${historyId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ body, code_snippet: codeSnippet })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Unknown error'}`);
        return;
      }

      setBody('');
      setCodeSnippet('');
      fetchAnswers();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Failed to submit answer", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (answerId) => {
    if (!user) {
      if (onShowAlert) onShowAlert('Please log in first');
      else alert('Please log in to like.');
      return;
    }
    try {
      await fetch(`${apiBase}/api/answers/${answerId}/like`, {
        method: 'POST',
        headers: authHeaders
      });
      fetchAnswers();
    } catch (err) {
      console.error("Failed to like answer", err);
    }
  };

  const handleDelete = async (answerId) => {
    if (!confirm("Are you sure you want to delete this solution?")) return;
    try {
      await fetch(`${apiBase}/api/answers/${answerId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      fetchAnswers();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Failed to delete answer", err);
    }
  };

  if (!historyId) return null;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-fuchsia-200">Community Solutions</h3>
        <span className="text-xs text-gray-400">{answers.length} solutions</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        {!user && (
          <div className="text-sm text-yellow-200 bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
            Please log in to share a solution.
          </div>
        )}
        <textarea
          className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
          placeholder="Explain your solution..."
          value={body}
          onChange={e => setBody(e.target.value)}
          required
        />
        <textarea
          className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 min-h-[70px] focus:outline-none focus:ring-2 focus:ring-indigo-600"
          placeholder="Optional code share..."
          value={codeSnippet}
          onChange={e => setCodeSnippet(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !user}
            className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Share Solution'}
          </button>
        </div>
      </form>

      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {loading && <div className="text-center text-gray-500">Loading...</div>}
        {!loading && answers.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-4">No solutions yet. Be the first to add one!</div>
        )}
        {answers.map(ans => (
          <div id={`answer-${ans.id}`} key={ans.id} className="bg-black/40 border border-gray-800 rounded-xl p-4 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span className="font-bold text-fuchsia-300">{ans.author}</span>
              <span>{ans.created_at}</span>
            </div>
            <div className="prose prose-invert max-w-none text-sm">
              <ReactMarkdown>{ans.body}</ReactMarkdown>
            </div>
            {ans.code_snippet && (
              <pre className="bg-black/60 text-xs text-gray-200 mt-3 p-3 rounded-lg overflow-auto font-mono border border-gray-700">
                {ans.code_snippet}
              </pre>
            )}
            <div className="flex gap-3 mt-3 text-xs">
              <button
                className="px-3 py-1 rounded-full bg-violet-700/60 text-white hover:bg-violet-700 transition flex items-center gap-1"
                onClick={() => handleLike(ans.id)}
              >
                👍 {ans.likes}
              </button>
              {user && (user.id === ans.author_id || user.is_admin) && (
                <button
                  className="px-3 py-1 rounded-full bg-red-600/70 text-white hover:bg-red-600 transition"
                  onClick={() => handleDelete(ans.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityAnswers;
