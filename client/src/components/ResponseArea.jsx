import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';

function extractCodeBlocks(text) {
  const codeRegex = /``([a-zA-Z]+)?([\s\S]*?)``/g;
  let match, codes = [];
  while((match = codeRegex.exec(text))) {
    codes.push({ lang: match[1] || '', code: match[2] });
  }
  return codes.length ? codes : null;
}

const ResponseArea = ({ response, loading }) => {
  const answerText = typeof response === 'string' ? response : response?.answer;
  const summaryText = response?.summary;

  if (loading) return (
    <div className="bg-gray-800 rounded-md p-4 min-h-[120px] text-gray-400 animate-pulse">Yanıt bekleniyor...</div>
  );
  if (!answerText) return (
    <div className="bg-gray-800 rounded-md p-4 min-h-[120px] text-gray-400">Henüz bir cevap yok.</div>
  );

  // Kod blogu varsa vurgulu render, yoksa markdown olarak göster
  const codes = extractCodeBlocks(answerText);
  if (codes) {
    return codes.map((blk, i) => (
      <SyntaxHighlighter
        key={i}
        language={blk.lang}
        style={materialDark}
        className="rounded-md my-2"
        wrapLongLines
      >
        {blk.code.trim()}
      </SyntaxHighlighter>
    ));
  }

  return (
    <div className="space-y-4">
      {summaryText && (
        <div className="bg-gradient-to-r from-indigo-900/70 to-purple-800/70 border border-indigo-500/40 rounded-lg p-4 text-sm text-indigo-100 shadow-md">
          <div className="text-xs uppercase tracking-widest text-indigo-300 mb-1">Özet</div>
          <ReactMarkdown>{summaryText}</ReactMarkdown>
        </div>
      )}
      <div className="bg-gray-800 rounded-md p-4 text-gray-100">
        <ReactMarkdown>{answerText}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ResponseArea;


