import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { marked } from "marked";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const markdownStyles = `
  .markdown-body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #334155;
    line-height: 1.75;
  }
  .markdown-body h1 {
    font-size: 2.25rem;
    font-weight: 800;
    color: #0f172a;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    letter-spacing: -0.03em;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 0.75rem;
  }
  .markdown-body h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }
  .markdown-body h3 {
    font-size: 1.15rem;
    font-weight: 600;
    color: #334155;
    margin-top: 1.75rem;
    margin-bottom: 0.75rem;
  }
  .markdown-body p {
    margin-bottom: 1.25rem;
  }
  .markdown-body a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.15s;
  }
  .markdown-body a:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }
  .markdown-body code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background-color: #f1f5f9;
    color: #ef4444;
    padding: 0.2rem 0.4rem;
    font-size: 0.875em;
    border-radius: 0.375rem;
    font-weight: 500;
  }
  .markdown-body pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 1.25rem;
    border-radius: 0.75rem;
    overflow-x: auto;
    margin: 1.5rem 0;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
  .markdown-body pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    font-size: 0.875rem;
    font-weight: 400;
    border-radius: 0;
  }
  .markdown-body ul {
    list-style-type: disc;
    margin-bottom: 1.25rem;
    padding-left: 1.625rem;
  }
  .markdown-body ol {
    list-style-type: decimal;
    margin-bottom: 1.25rem;
    padding-left: 1.625rem;
  }
  .markdown-body li {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
  .markdown-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }
  .markdown-body th {
    background-color: #f8fafc;
    color: #475569;
    font-weight: 600;
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  .markdown-body td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
  }
  .markdown-body tr:last-child td {
    border-bottom: none;
  }
  .markdown-body blockquote {
    border-left: 4px solid #3b82f6;
    background-color: #eff6ff;
    color: #1e3a8a;
    padding: 0.75rem 1.25rem;
    margin: 1.5rem 0;
    border-radius: 0 0.5rem 0.5rem 0;
    font-style: italic;
  }
  .markdown-body hr {
    border: 0;
    border-top: 1px solid #e2e8f0;
    margin: 2.5rem 0;
  }
`;

const Docs = () => {
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [innerToc, setInnerToc] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentContainerRef = useRef(null);

  // Configure marked renderer for headers anchors
  useEffect(() => {
    const renderer = new marked.Renderer();
    renderer.heading = (text, level) => {
      const rawText = typeof text === "object" ? text.text : text;
      const cleanText = rawText.replace(/<[^>]*>/g, "");
      const slug = cleanText
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      
      // Skip injecting class on h1 to avoid duplicates
      if (level === 1) {
        return `<h1 id="${slug}">${rawText}</h1>`;
      }
      return `<h${level} id="${slug}" class="heading-anchor font-bold">${rawText}</h${level}>`;
    };
    marked.use({ renderer });
  }, []);

  // Fetch chapters list on mount
  useEffect(() => {
    const fetchChapters = async () => {
      setLoadingList(true);
      setError("");
      try {
        const res = await axios.get(`${backendUrl}/api/docs`);
        setChapters(res.data);
        if (res.data.length > 0) {
          // Load first chapter by default
          loadChapterContent(res.data[0].slug);
        }
      } catch (err) {
        setError("Failed to fetch chapters. Make sure backend is running.");
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchChapters();
  }, []);

  // Fetch individual chapter content
  const loadChapterContent = async (slug) => {
    setLoadingContent(true);
    setMobileMenuOpen(false);
    try {
      const res = await axios.get(`${backendUrl}/api/docs/${slug}`);
      setActiveChapter(res.data);

      const html = marked.parse(res.data.content);
      setHtmlContent(html);

      // Extract headings (H2 and H3) for active chapter outline
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const headings = tempDiv.querySelectorAll("h2, h3");
      const generatedToc = Array.from(headings).map((heading) => {
        const text = heading.textContent;
        const id = heading.getAttribute("id") || text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
        const level = parseInt(heading.tagName.substring(1), 10);
        return { text, id, level };
      });
      setInnerToc(generatedToc);
      setActiveSectionId("");
      window.scrollTo(0, 0); // Scroll top on chapter switch
    } catch (err) {
      console.error(`Error loading chapter ${slug}:`, err);
    } finally {
      setLoadingContent(false);
    }
  };

  // Scroll spy to highlight active inner section
  useEffect(() => {
    if (loadingContent || !innerToc.length) return;

    const handleScroll = () => {
      const headings = document.querySelectorAll(".heading-anchor");
      const scrollPosition = window.scrollY + 110; // Offset for sticky header

      let currentActiveId = "";
      headings.forEach((heading) => {
        const top = heading.getBoundingClientRect().top + window.scrollY;
        if (scrollPosition >= top) {
          currentActiveId = heading.getAttribute("id");
        }
      });

      if (currentActiveId && currentActiveId !== activeSectionId) {
        setActiveSectionId(currentActiveId);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingContent, innerToc, activeSectionId]);

  // Jump to specific inner heading section
  const handleSectionClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 95;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSectionId(id);
    }
  };

  // Pagination navigation triggers
  const getActiveChapterIndex = () => {
    if (!activeChapter) return -1;
    return chapters.findIndex((c) => c.slug === activeChapter.slug);
  };

  const handlePrevPage = () => {
    const currentIndex = getActiveChapterIndex();
    if (currentIndex > 0) {
      loadChapterContent(chapters[currentIndex - 1].slug);
    }
  };

  const handleNextPage = () => {
    const currentIndex = getActiveChapterIndex();
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      loadChapterContent(chapters[currentIndex + 1].slug);
    }
  };

  // Filter chapters based on global search queries
  const filteredChapters = chapters.filter((ch) =>
    ch.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentIndex = getActiveChapterIndex();
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <style>{markdownStyles}</style>

      {/* Top Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">ATS Portal Docs</h1>
            <p className="text-xs text-slate-500 font-medium">Developer Handoff Guide</p>
          </div>
        </div>

        {/* Header Search Box */}
        <div className="hidden md:flex items-center relative max-w-md w-full mx-8">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search chapters by title..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all"
          >
            ← Back to Dashboard
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white shadow-sm"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex relative">
        
        {/* Sidebar Chapters (Desktop) */}
        <aside className="hidden md:block w-80 border-r border-slate-200 bg-white p-6 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto shrink-0 select-none">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Documentation Modules</h2>
              <nav className="space-y-1">
                {filteredChapters.map((chapter) => {
                  const isActive = activeChapter?.slug === chapter.slug;
                  return (
                    <div key={chapter.slug} className="space-y-1">
                      <button
                        onClick={() => loadChapterContent(chapter.slug)}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-medium flex items-center justify-between group ${
                          isActive
                            ? "text-blue-600 bg-blue-50/70 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{chapter.title}</span>
                      </button>

                      {/* Display inner page subheadings under active chapter title */}
                      {isActive && innerToc.length > 0 && (
                        <div className="ml-3 pl-3 border-l border-slate-200 py-1 space-y-1">
                          {innerToc.map((sec, idx) => {
                            const paddingLeft = sec.level === 3 ? "pl-3 text-xs" : "text-xs";
                            const isSectionActive = activeSectionId === sec.id;
                            return (
                              <a
                                key={idx}
                                href={`#${sec.id}`}
                                onClick={(e) => handleSectionClick(e, sec.id)}
                                className={`block py-1 truncate transition-colors ${paddingLeft} ${
                                  isSectionActive
                                    ? "text-blue-600 font-medium"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                {sec.text}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredChapters.length === 0 && (
                  <p className="text-xs text-slate-400 italic px-3">No matching chapters.</p>
                )}
              </nav>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            
            <aside className="relative flex flex-col w-full max-w-xs bg-white h-full p-6 shadow-xl z-50 animate-slide-right overflow-y-auto">
              <div className="mb-6 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800">Modules List</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Search Box */}
              <div className="mb-6 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="search"
                  placeholder="Search chapters..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <nav className="space-y-1">
                {filteredChapters.map((chapter) => {
                  const isActive = activeChapter?.slug === chapter.slug;
                  return (
                    <div key={chapter.slug} className="space-y-1">
                      <button
                        onClick={() => loadChapterContent(chapter.slug)}
                        className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-between ${
                          isActive
                            ? "text-blue-600 bg-blue-50/70 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{chapter.title}</span>
                      </button>
                    </div>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Content Panel */}
        <main className="flex-1 min-w-0 bg-white md:bg-slate-50/20 px-6 md:px-12 py-10 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl md:shadow-sm md:border border-slate-200/60 p-6 md:p-10">
            {loadingList ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-500 font-medium">Loading documentation index...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl flex items-start" role="alert">
                <svg className="w-6 h-6 mr-3 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Index Retrieval Failed</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Last Updated */}
                {activeChapter?.updatedAt && (
                  <div className="absolute top-0 right-0 text-xs text-slate-400 font-medium hidden sm:block">
                    Updated: {new Date(activeChapter.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}

                {loadingContent ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-500 font-medium">Fetching module details...</p>
                  </div>
                ) : (
                  <div>
                    {/* Rendered HTML */}
                    <div
                      ref={contentContainerRef}
                      className="markdown-body"
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    ></div>

                    {/* Pagination Links */}
                    <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between">
                      {prevChapter ? (
                        <button
                          onClick={handlePrevPage}
                          className="flex flex-col items-start px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all group max-w-[45%]"
                        >
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Previous Module</span>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 truncate w-full">{prevChapter.title}</span>
                        </button>
                      ) : (
                        <div />
                      )}

                      {nextChapter ? (
                        <button
                          onClick={handleNextPage}
                          className="flex flex-col items-end px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all group max-w-[45%]"
                        >
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Module</span>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 truncate w-full">{nextChapter.title}</span>
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 p-3 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all z-50 cursor-pointer hidden md:flex items-center justify-center"
        title="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default Docs;
