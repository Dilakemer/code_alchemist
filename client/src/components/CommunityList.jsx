import React, { useState } from 'react';

const CommunityList = ({ items, onSelect, activeId, apiBase, authHeaders, onDelete }) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (e, item) => {
        e.stopPropagation();
        setDeleteTarget(item);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            const res = await fetch(`${apiBase}/api/posts/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...authHeaders }
            });

            if (res.ok) {
                setDeleteModalOpen(false);
                setDeleteTarget(null);
                if (onDelete) onDelete(deleteTarget.id);
            } else {
                const data = await res.json();
                alert(data.error || 'Gönderi silinemedi.');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Bağlantı hatası.');
        } finally {
            setDeleting(false);
        }
    };

    if (!items || items.length === 0) {
        return (
            <div className="text-gray-500 text-sm text-center mt-10 px-4">
                Henüz topluluk sorusu yok.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2 p-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border group ${activeId === `community-${item.id}`
                            ? 'bg-fuchsia-900/40 border-fuchsia-500/50 shadow-lg shadow-fuchsia-900/20'
                            : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-fuchsia-300 truncate max-w-[60%]">
                                {item.selected_model || 'AI'}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500">{item.timestamp}</span>
                                {/* Delete button */}
                                <button
                                    onClick={(e) => handleDeleteClick(e, item)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-0.5"
                                    title="Gönderiyi Sil"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-300 line-clamp-2 font-medium">
                            {item.user_question}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] bg-gray-700/50 px-1.5 py-0.5 rounded text-gray-400">
                                👍 {item.likes || 0}
                            </span>
                            {item.answer_count > 0 && (
                                <span className="text-[10px] bg-indigo-900/30 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/30">
                                    {item.answer_count} Çözüm
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Gönderiyi Sil</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Bu gönderi ve tüm yorumları kalıcı olarak silinecek. Devam etmek istiyor musunuz?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setDeleteTarget(null);
                                }}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Siliniyor...' : 'Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommunityList;
