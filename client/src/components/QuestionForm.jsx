import React from 'react';

const QuestionForm = ({ question, setQuestion, code, setCode, onAsk, loading }) => (
  <form
    onSubmit={e => {
      e.preventDefault();
      onAsk();
    }}
    className="space-y-4"
  >
    <div>
      <label className="block text-gray-200 mb-1">Sorunuzu Yazın:</label>
      <textarea
        className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-4 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-700"
        placeholder="Sorunuzu buraya yazın..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
        required
      />
    </div>
    <div>
      <label className="block text-gray-200 mb-1">Kod (Opsiyonel):</label>
      <textarea
        className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-4 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-700"
        placeholder="Kodunuzu buraya yapıştırın..."
        value={code}
        onChange={e => setCode(e.target.value)}
      />
    </div>
    <div className="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-700 hover:bg-purple-800 transition text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Yükleniyor...' : 'Sor'}
      </button>
    </div>
  </form>
);

export default QuestionForm;



