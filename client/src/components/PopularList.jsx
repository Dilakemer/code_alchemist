import React from 'react';

const PopularList = ({ items }) => {
  if (!items.length) {
    return (
      <div className="bg-black/40 border border-indigo-900 rounded-xl p-4 text-xs text-gray-400">
        Popüler çözüm yok. Soru sorarak vitrine katkı yap!
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-indigo-800 rounded-2xl p-4 shadow-xl">
      <h3 className="text-sm font-semibold text-indigo-200 tracking-wide mb-3 uppercase">Popüler Çözümler</h3>
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="bg-gray-900/40 rounded-xl p-3 border border-indigo-700/40">
            <div className="flex justify-between text-xs text-indigo-300 mb-1">
              <span>{item.timestamp}</span>
              <span>👍 {item.likes}</span>
            </div>
            <div className="text-gray-100 font-semibold text-sm">
              {item.user_question.slice(0,70)}{item.user_question.length>70?'...':''}
            </div>
            {item.summary && (
              <p className="text-xs text-indigo-100 mt-2 whitespace-pre-line">
                {item.summary.slice(0,160)}{item.summary.length>160?'...':''}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularList;


