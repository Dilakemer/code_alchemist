import React from 'react';

const Notifications = ({ notifications, onSelect, onDelete }) => {
    if (!notifications || !notifications.length) return (
        <div className="bg-gray-900/60 rounded-lg p-4 border border-violet-800 text-xs text-gray-400 text-center drop-shadow-sm">
            No new notifications.
        </div>
    );

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold text-white mb-4 px-1">Notifications</h2>
            <ul className="space-y-3">
                {notifications.map(item => (
                    <li
                        key={item.id}
                        className={`relative p-3 rounded-xl border-2 transition-all shadow-lg group ${item.is_read
                            ? 'border-gray-800 bg-black/20 opacity-60 hover:opacity-100'
                            : 'border-fuchsia-900/50 bg-black/40 hover:bg-fuchsia-900/20 hover:border-fuchsia-500'
                            }`}
                    >
                        <div
                            onClick={() => onSelect(item)}
                            className="flex items-start gap-3 cursor-pointer"
                        >
                            <div className={`mt-1 min-w-[8px] min-h-[8px] rounded-full ${item.is_read ? 'bg-gray-600' : 'bg-fuchsia-500 animate-pulse'}`}></div>
                            <div className="flex-1 pr-6">
                                <p className={`text-sm font-medium transition-colors ${item.is_read ? 'text-gray-400' : 'text-gray-200 group-hover:text-fuchsia-300'}`}>
                                    {item.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Topic: {item.question_title}
                                </p>
                                <p className="text-[10px] text-gray-600 mt-2">
                                    {item.created_at}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id);
                            }}
                            className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition-colors p-1"
                            title="Delete Notification"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;
