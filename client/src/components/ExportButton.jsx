import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const ExportButton = ({ chatHistory, conversationTitle }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const exportToMarkdown = () => {
        if (!chatHistory || chatHistory.length === 0) {
            alert('No chat history to export');
            return;
        }

        let markdown = `# ${conversationTitle || 'Chat Export'}\n\n`;
        markdown += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

        chatHistory.forEach((turn, index) => {
            markdown += `## 💬 Question ${index + 1}\n\n`;
            markdown += `${turn.user_question}\n\n`;

            if (turn.code_snippet) {
                markdown += `### Code:\n\`\`\`\n${turn.code_snippet}\n\`\`\`\n\n`;
            }

            markdown += `## 🤖 AI Response\n\n`;
            markdown += `${turn.ai_response}\n\n`;
            markdown += `---\n\n`;
        });

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conversationTitle || 'chat-export'}.md`;
        a.click();
        URL.revokeObjectURL(url);
        setShowMenu(false);
    };

    const exportToPDF = () => {
        if (!chatHistory || chatHistory.length === 0) {
            alert('No chat history to export');
            return;
        }

        const doc = new jsPDF();
        let y = 20;
        const lineHeight = 7;
        const pageHeight = 280;
        const margin = 20;
        const maxWidth = 170;

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(conversationTitle || 'Chat Export', margin, y);
        y += 10;

        // Date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(`Exported on ${new Date().toLocaleString()}`, margin, y);
        y += 15;
        doc.setTextColor(0, 0, 0);

        chatHistory.forEach((turn, index) => {
            // Check for page break
            if (y > pageHeight - 40) {
                doc.addPage();
                y = 20;
            }

            // Question
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(139, 92, 246); // Purple
            doc.text(`Question ${index + 1}:`, margin, y);
            y += lineHeight;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const questionLines = doc.splitTextToSize(turn.user_question || '', maxWidth);
            questionLines.forEach(line => {
                if (y > pageHeight) { doc.addPage(); y = 20; }
                doc.text(line, margin, y);
                y += lineHeight;
            });
            y += 5;

            // Code snippet if exists
            if (turn.code_snippet) {
                if (y > pageHeight - 20) { doc.addPage(); y = 20; }
                doc.setFontSize(10);
                doc.setFont('courier', 'normal');
                doc.setTextColor(100, 100, 100);
                const codeLines = doc.splitTextToSize(turn.code_snippet.substring(0, 500), maxWidth);
                codeLines.slice(0, 10).forEach(line => {
                    if (y > pageHeight) { doc.addPage(); y = 20; }
                    doc.text(line, margin, y);
                    y += 5;
                });
                y += 5;
            }

            // AI Response
            if (y > pageHeight - 20) { doc.addPage(); y = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(16, 185, 129); // Green
            doc.text('AI Response:', margin, y);
            y += lineHeight;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const responseText = (turn.ai_response || '').replace(/```[\s\S]*?```/g, '[Code Block]');
            const responseLines = doc.splitTextToSize(responseText.substring(0, 2000), maxWidth);
            responseLines.slice(0, 30).forEach(line => {
                if (y > pageHeight) { doc.addPage(); y = 20; }
                doc.text(line, margin, y);
                y += 5;
            });

            y += 15;
        });

        doc.save(`${conversationTitle || 'chat-export'}.pdf`);
        setShowMenu(false);
    };

    const exportCodeSnippets = () => {
        if (!chatHistory || chatHistory.length === 0) {
            alert('No chat history to export');
            return;
        }

        const codeSnippets = chatHistory
            .filter(turn => turn.code_snippet)
            .map((turn, index) => `// === Snippet ${index + 1} ===\n// Question: ${turn.user_question?.substring(0, 100)}...\n\n${turn.code_snippet}`)
            .join('\n\n// ================================\n\n');

        if (!codeSnippets) {
            alert('No code snippets found in this conversation');
            return;
        }

        const blob = new Blob([codeSnippets], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conversationTitle || 'code-snippets'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setShowMenu(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
                title="Export Chat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
            </button>

            {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-xl border border-gray-700 shadow-xl z-50 overflow-hidden animate-fadeIn">
                    <button
                        onClick={exportToMarkdown}
                        className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                        <span>📝</span> Export as Markdown
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors border-t border-gray-700"
                    >
                        <span>📄</span> Export as PDF
                    </button>
                    <button
                        onClick={exportCodeSnippets}
                        className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors border-t border-gray-700"
                    >
                        <span>💻</span> Export Code Only
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportButton;
