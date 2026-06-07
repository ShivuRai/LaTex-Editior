"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FileText, Moon, Sun, AlertCircle, Play } from 'lucide-react';

if (typeof window !== 'undefined') {
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
  }
  if (!window.process) {
    (window as any).process = { env: {} };
  }
  if (window.process && !(window.process as any).addListener) {
    (window.process as any).addListener = () => {};
  }
  if (window.process && !(window.process as any).removeListener) {
    (window.process as any).removeListener = () => {};
  }
  
  // Polyfill matchMedia addListener for Monaco Editor
  if (window.matchMedia) {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      const mql = originalMatchMedia(query);
      if (!mql) {
        return { matches: false, addListener: function(){}, removeListener: function(){} } as any;
      }
      if (!mql.addListener) {
        mql.addListener = function() {};
        mql.removeListener = function() {};
      }
      return mql;
    };
  }
}

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import debounce from 'lodash.debounce';

const TEMPLATES = {
  resume: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\begin{document}
\\begin{center}
  {\\Huge \\textbf{John Doe}} \\\\
  johndoe@email.com $\\cdot$ (123) 456-7890 $\\cdot$ LinkedIn/in/johndoe
\\end{center}
\\section*{Education}
\\textbf{University of Tech} \\hfill 2019 - 2023 \\\\
B.S. in Computer Science
\\section*{Experience}
\\textbf{Software Engineer Intern} \\hfill Summer 2022 \\\\
Tech Corp, San Francisco, CA
\\begin{itemize}
  \\item Developed a new feature.
  \\item Improved performance by 20\\%.
\\end{itemize}
\\end{document}`,
  ieee: `\\documentclass[conference]{IEEEtran}
\\begin{document}
\\title{My Awesome Paper}
\\author{\\IEEEauthorblockN{1\\textsuperscript{st} Given Name Surname}
\\IEEEauthorblockA{\\textit{dept. name of organization (of Aff.)} \\\\
\\textit{name of organization (of Aff.)}\\\\
City, Country \\\\
email address or ORCID}}
\\maketitle
\\begin{abstract}
This document is a model and instructions for LaTeX.
\\end{abstract}
\\section{Introduction}
This is the introduction section.
\\end{document}`,
  coverLetter: `\\documentclass[11pt]{letter}
\\usepackage[margin=1in]{geometry}
\\signature{John Doe}
\\address{123 Main St \\\\ City, State 12345}
\\begin{document}
\\begin{letter}{Hiring Manager \\\\ Tech Company \\\\ 456 Tech Blvd}
\\opening{Dear Hiring Manager,}

I am writing to express my interest in the Software Engineer position.

\\closing{Sincerely,}
\\end{letter}
\\end{document}`
};

export default function Home() {
  const [code, setCode] = useState(TEMPLATES.resume);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string | null>(null);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [splitPos, setSplitPos] = useState(50);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedCode = localStorage.getItem('latex-code');
    const savedTheme = localStorage.getItem('latex-theme') as 'vs-dark' | 'light';
    if (savedCode) setCode(savedCode);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('latex-code', code);
    localStorage.setItem('latex-theme', theme);
  }, [code, theme]);

  const compilePdf = async (latex: string) => {
    setIsCompiling(true);
    setErrorLogs(null);
    try {
      const res = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: [{ path: 'main.tex', content: latex }]
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        setErrorLogs(errorText || 'Unknown compilation error');
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
          setPdfUrl(null);
        }
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(url);
      }
    } catch (err: any) {
      setErrorLogs(err.message || 'Network error');
    } finally {
      setIsCompiling(false);
    }
  };

  // Debounced compile function (2000ms)
  const debouncedCompile = useCallback(
    debounce((latex: string) => compilePdf(latex), 2000),
    []
  );

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    debouncedCompile(newCode);
  };

  const handleManualCompile = () => {
    debouncedCompile.cancel();
    compilePdf(code);
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'document.pdf';
      a.click();
    } else {
      alert('Compile the document successfully first.');
    }
  };

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as keyof typeof TEMPLATES;
    if (key && TEMPLATES[key]) {
      if (confirm('This will overwrite your current code. Continue?')) {
        const newCode = TEMPLATES[key];
        setCode(newCode);
        compilePdf(newCode); // Compile immediately on template change
      }
    }
    e.target.value = ''; // Reset select
  };

  // Resizable pane logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newPos = (e.clientX / window.innerWidth) * 100;
    if (newPos > 20 && newPos < 80) {
      setSplitPos(newPos);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Initial compile on mount if there's code
  useEffect(() => {
    if (code) {
      compilePdf(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`flex flex-col h-screen ${theme === 'vs-dark' ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'}`}>
      {/* Header Toolbar */}
      <header className={`flex items-center justify-between px-6 py-3 border-b ${theme === 'vs-dark' ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-500">\TeX</span> Editor
          </h1>
          <select 
            onChange={handleTemplateSelect} 
            className={`ml-4 text-sm px-3 py-1.5 rounded-md border ${theme === 'vs-dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'}`}
          >
            <option value="">Choose Template...</option>
            <option value="resume">Professional Resume</option>
            <option value="ieee">IEEE Academic Paper</option>
            <option value="coverLetter">Cover Letter</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleManualCompile}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            <Play size={16} /> Compile
          </button>
          <button 
            onClick={handleDownloadPdf}
            disabled={!pdfUrl}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${pdfUrl ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-zinc-500 cursor-not-allowed text-zinc-300'}`}
          >
            <FileText size={16} /> PDF
          </button>

          <button 
            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            className={`p-2 rounded-full transition-colors ${theme === 'vs-dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'}`}
          >
            {theme === 'vs-dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Editor Pane */}
        <div style={{ width: `${splitPos}%` }} className="h-full relative flex flex-col">
          {isMounted ? (
            <Editor
              height="100%"
              language="latex"
              theme={theme}
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbersMinChars: 3,
                fontSize: 14,
                padding: { top: 16 }
              }}
            />
          ) : (
            <div className="h-full w-full bg-zinc-900" />
          )}
          {isCompiling && (
            <div className="absolute bottom-4 right-4 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" /> Compiling...
            </div>
          )}
        </div>

        {/* Draggable Divider */}
        <div 
          ref={dividerRef}
          onMouseDown={handleMouseDown}
          className={`w-1.5 cursor-col-resize hover:bg-blue-500 transition-colors ${theme === 'vs-dark' ? 'bg-zinc-800' : 'bg-zinc-200'}`}
        />

        {/* Preview Pane */}
        <div style={{ width: `${100 - splitPos}%` }} className="h-full relative bg-zinc-900/50">
          {errorLogs ? (
            <div className="absolute inset-0 p-6 overflow-auto font-mono text-sm">
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                <h3 className="flex items-center gap-2 font-bold mb-4 text-red-500">
                  <AlertCircle size={20} /> Compilation Failed
                </h3>
                <pre className="whitespace-pre-wrap">{errorLogs}</pre>
              </div>
            </div>
          ) : pdfUrl ? (
             <iframe src={pdfUrl} className="w-full h-full border-none" title="PDF Preview" />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              {isCompiling ? 'Generating Preview...' : 'No Preview Available'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
