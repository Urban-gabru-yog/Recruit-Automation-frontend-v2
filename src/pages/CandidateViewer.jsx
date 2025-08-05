// CandidateViewer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Replaced Heroicons imports with inlined SVG components
const CheckCircleIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.81a.75.75 0 1 0-1.22-1.09l-4.72 5.23L7.15 12.63l-2.22 2.22a.75.75 0 0 0 1.06 1.06l3.28-3.28a.75.75 0 0 0 0-1.06L14.4 9.19Z"
      clipRule="evenodd"
    />
  </svg>
);

const XCircleIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.897 8.72a.75.75 0 1 0-1.06-1.06l-2.094 2.093-.853-.854a.75.75 0 0 0-1.06 1.06l1.4 1.4a.75.75 0 0 0 1.06 0l2.64-2.64Zm6.241-1.42a.75.75 0 0 0-1.06-1.06L12 11.94l-2.094-2.093a.75.75 0 1 0-1.06 1.06L10.94 13l-2.093 2.094a.75.75 0 1 0 1.06 1.06L12 14.06l2.094 2.093a.75.75 0 1 0 1.06-1.06L13.06 13l2.093-2.094Z"
      clipRule="evenodd"
    />
  </svg>
);

const EyeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6Z" />
    <path
      fillRule="evenodd"
      d="M1.323 11.447C2.822 6.579 7.41 3.5 12 3.5c4.59 0 9.178 3.079 10.677 7.947a.75.75 0 010 .946C21.178 17.421 16.59 20.5 12 20.5c-4.59 0-9.178-3.079-10.677-7.947a.75.75 0 010-.946ZM12 13.5a2 2 0 100-4 2 2 0 000 4Z"
      clipRule="evenodd"
    />
  </svg>
);

const EyeSlashIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M.333 11.242C3.733 4.542 9.479 2.25 12 2.25c2.51 0 8.257 2.292 11.667 8.992a.75.75 0 010 .916C20.257 17.208 14.511 19.5 12 19.5c-2.51 0-8.257-2.292-11.667-8.992a.75.75 0 010-.916Z" />
    <path
      fillRule="evenodd"
      d="M12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9ZM12 14.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const EnvelopeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.625 4.766a3 3 0 01-2.75 0L1.5 8.67z" />
    <path d="M18.75 5.25a3 3 0 00-3-3h-9a3 3 0 00-3 3v.681l8.067 4.459L22.5 5.932V5.25z" />
  </svg>
);

const ArrowPathIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.648A11.96 11.96 0 0012 22.583 11.96 11.96 0 0021.012 15M2.985 19.648v4.992m0-.001h4.992m-4.99-4.99l.001-.002"
    />
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const ChevronUpIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 15.75 7.5-7.5 7.5 7.5"
    />
  </svg>
);

const CandidateViewer = () => {
  const { job_id } = useParams();
  const [job, setJob] = useState(null);
  const [shortlisted, setShortlisted] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [showRejected, setShowRejected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [atsRejected, setAtsRejected] = useState([]);
  const [showAtsRejected, setShowAtsRejected] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Pagination states
  const [filteredPage, setFilteredPage] = useState(1);
  const [shortlistedPage, setShortlistedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [atsRejectedPage, setAtsRejectedPage] = useState(1);
  const itemsPerPage = 9;

  // Expandable content states
  const [expandedCards, setExpandedCards] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${backendUrl}/api/jobs/${job_id}`);
      setJob(res.data.job);
      const candidates = res.data.candidates || [];
      setFiltered(
        candidates.filter((c) => c.status === "shortlisted" && !c.hr_status)
      );
      setShortlisted(candidates.filter((c) => c.hr_status === "shortlisted"));
      setRejected(candidates.filter((c) => c.hr_status === "rejected"));
      setAtsRejected(
        candidates.filter((c) => (c.ats_score ?? 100) < 70 && !c.hr_status)
      );
    } catch (err) {
      setError("Failed to fetch candidate data. Please try again.");
      console.error("Fetch candidates error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [job_id]);

  const handleStatusUpdate = async (id, status) => {
    if (
      !window.confirm(
        `Are you sure you want to mark this candidate as ${status.toUpperCase()}?`
      )
    ) {
      return;
    }
    setError("");
    setUpdatingStatus(id);
    try {
      await axios.post(`${backendUrl}/api/form/update-status/${id}`, {
        hr_status: status,
      });
      alert(
        `Candidate marked as ${
          status.charAt(0).toUpperCase() + status.slice(1)
        }.`
      );
      fetchData();
    } catch (err) {
      setError("Failed to update candidate status. Please try again.");
      console.error("Status update failed:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleCardExpansion = (cardId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const renderCustomAnswers = (answers, isExpanded = false) => {
    if (!answers || Object.keys(answers).length === 0) {
      return <span className="text-gray-500">N/A</span>;
    }

    const entries = Object.entries(answers);
    const displayEntries = isExpanded ? entries : entries.slice(0, 2);

    return (
      <div className="space-y-2">
        {displayEntries.map(([q, a]) => (
          <div key={q} className="text-sm border-l-2 border-gray-200 pl-3">
            <div className="font-medium text-gray-800 mb-1 break-words">
              {truncateText(q, 80)}
            </div>
            <div className="text-gray-600 break-words">
              {truncateText(a, isExpanded ? 500 : 80)}
            </div>
          </div>
        ))}
        {entries.length > 2 && (
          <div className="text-xs text-blue-600">
            {isExpanded ? "" : `+${entries.length - 2} more answers`}
          </div>
        )}
      </div>
    );
  };

  const renderCandidateCard = (c, showActions = false) => {
    const isExpanded = expandedCards.has(c.id);

    return (
      <div
        key={c.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        {/* Card Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-gray-900 truncate">
                {c.name}
              </h4>
              <p className="text-sm text-blue-600 hover:underline truncate">
                <a href={`mailto:${c.email}`} className="break-all">
                  {c.email}
                </a>
              </p>
              <p className="text-sm text-gray-500 truncate">
                {c.phone || <span className="italic">N/A</span>}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg">
                <span className="text-lg font-bold">
                  {c.ats_score || "N/A"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                ATS Score
              </p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-4">
          {/* Summary Section */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Summary</p>
            <div className="text-sm text-gray-600 leading-relaxed">
              {c.summary ? (
                <p className="break-words">
                  {isExpanded ? c.summary : truncateText(c.summary, 120)}
                </p>
              ) : (
                <span className="italic text-gray-400">Not provided</span>
              )}
            </div>
          </div>

          {/* Shortlisting Reason */}
          {c.shortlisting_reason && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Reason for Shortlisting
              </p>
              <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                <p className="break-words">
                  {isExpanded
                    ? c.shortlisting_reason
                    : truncateText(c.shortlisting_reason, 120)}
                </p>
              </div>
            </div>
          )}

          {/* Custom Answers */}
          {c.custom_answers && Object.keys(c.custom_answers).length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Custom Answers
              </p>
              <div className="bg-gray-50 p-3 rounded-md">
                {renderCustomAnswers(c.custom_answers, isExpanded)}
              </div>
            </div>
          )}

          {/* Expand/Collapse Button */}
          {(c.summary?.length > 120 ||
            c.shortlisting_reason?.length > 120 ||
            (c.custom_answers && Object.keys(c.custom_answers).length > 2)) && (
            <button
              onClick={() => toggleCardExpansion(c.id)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-4 h-4" />
                  Show More
                </>
              )}
            </button>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {c.resume_url ? (
              <a
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                href={c.resume_url}
                target="_blank"
                rel="noreferrer"
              >
                <EyeIcon className="w-4 h-4" />
                View Resume
              </a>
            ) : (
              <span className="text-sm text-gray-500">Resume N/A</span>
            )}

            {/* Replace the existing action buttons section in Card Footer with this improved version */}

            {showActions && (
              <div className="flex gap-3">
                <button
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                  onClick={() => handleStatusUpdate(c.id, "shortlisted")}
                  disabled={updatingStatus === c.id}
                >
                  {updatingStatus === c.id ? "Processing..." : "Shortlist"}
                </button>
                <button
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:text-white hover:bg-red-600 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  onClick={() => handleStatusUpdate(c.id, "rejected")}
                  disabled={updatingStatus === c.id}
                >
                  {updatingStatus === c.id ? "Processing..." : "Reject"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = (currentPage, setCurrentPage, totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else {
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, start + 4);
              pageNum = start + i;
              if (pageNum > end) return null;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === pageNum
                    ? "text-white bg-blue-600 border border-blue-600"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  const renderSection = (
    title,
    list,
    showActions = false,
    id = null,
    currentPage = 1,
    setCurrentPage = null
  ) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedList = list.slice(startIndex, endIndex);

    return (
      <section className="mb-8" id={id}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {list.length} candidates
                </span>
                {list.length > itemsPerPage && (
                  <span className="text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(endIndex, list.length)}{" "}
                    of {list.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {list.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <EyeSlashIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  No candidates in this category
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedList.map((c) =>
                    renderCandidateCard(c, showActions)
                  )}
                </div>
                {setCurrentPage &&
                  renderPagination(currentPage, setCurrentPage, list.length)}
              </>
            )}
          </div>
        </div>
      </section>
    );
  };

  const handleOpenMail = () => {
    if (!shortlisted.length) {
      alert("No HR Shortlisted candidates to email.");
      return;
    }
    if (!job?.team_lead_email) {
      alert("Team Lead email not available for this job.");
      return;
    }

    const subject = `HR Shortlisted Candidates: ${job.position} | ${job.team}`;
    const to = job.team_lead_email;
    const body = shortlisted
      .map(
        (c, i) => `
${i + 1}. ${c.name}
• Email: ${c.email}
• Score: ${c.ats_score || "N/A"}
• Summary: ${c.summary || "N/A"}
• Resume: ${c.resume_url || "N/A"}
${c.shortlisting_reason ? `• Reason: ${c.shortlisting_reason}` : ""}
------------------------------`
      )
      .join("\n");
    const mailtoLink = `mailto:${encodeURIComponent(
      to
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  if (loading && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Candidates
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Candidates for: {job?.position}
            </h1>
            <p className="text-lg text-gray-600 mb-8">Team: {job?.team}</p>

            {/* Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <a
                href="#pending-candidates"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Pending ({filtered.length})
              </a>
              <a
                href="#hr-shortlisted"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Shortlisted ({shortlisted.length})
              </a>
              <button
                onClick={() => setShowRejected(!showRejected)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {showRejected ? "Hide" : "View"} Rejected ({rejected.length})
              </button>
              <button
                onClick={() => setShowAtsRejected(!showAtsRejected)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {showAtsRejected ? "Hide" : "View"} ATS Rejected (
                {atsRejected.length})
              </button>
            </div>

            {/* Email Button */}
            <button
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleOpenMail}
              disabled={shortlisted.length === 0}
            >
              <EnvelopeIcon className="mr-3 h-5 w-5" />
              Email Shortlisted to Team Leader
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="space-y-8">
          {renderSection(
            "Pending Review (ATS Shortlisted)",
            filtered,
            true,
            "pending-candidates",
            filteredPage,
            setFilteredPage
          )}
          {renderSection(
            "HR Shortlisted Candidates",
            shortlisted,
            false,
            "hr-shortlisted",
            shortlistedPage,
            setShortlistedPage
          )}
          {showRejected &&
            renderSection(
              "HR Rejected Candidates",
              rejected,
              false,
              null,
              rejectedPage,
              setRejectedPage
            )}
          {showAtsRejected &&
            renderSection(
              "ATS Rejected Candidates (Score < 70)",
              atsRejected,
              false,
              null,
              atsRejectedPage,
              setAtsRejectedPage
            )}
        </main>
      </div>
    </div>
  );
};

export default CandidateViewer;

// // CandidateViewer.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// const backendUrl = import.meta.env.VITE_BACKEND_URL;

// const CandidateViewer = () => {
//   const { job_id } = useParams();
//   const [job, setJob] = useState(null);
//   const [shortlisted, setShortlisted] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [rejected, setRejected] = useState([]);
//   const [showRejected, setShowRejected] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [atsRejected, setAtsRejected] = useState([]);
//   const [showAtsRejected, setShowAtsRejected] = useState(false);

//   const fetchData = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await axios.get(
//         `${backendUrl}/api/jobs/${job_id}`
//       );
//       setJob(res.data.job);
//       const candidates = res.data.candidates || [];
//       // Candidates with 'shortlisted' status from ATS, but not yet reviewed by HR
//       setFiltered(
//         candidates.filter((c) => c.status === "shortlisted" && !c.hr_status)
//       );
//       // Candidates HR has officially 'shortlisted'
//       setShortlisted(candidates.filter((c) => c.hr_status === "shortlisted"));
//       // Candidates HR has officially 'rejected'
//       setRejected(candidates.filter((c) => c.hr_status === "rejected"));

//       setAtsRejected(
//         candidates.filter((c) => (c.ats_score ?? 100) < 70 && !c.hr_status)
//       );
//     } catch (err) {
//       setError("Failed to fetch candidate data. Please try again.");
//       console.error("Fetch candidates error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [job_id]);

//   const handleStatusUpdate = async (id, status) => {
//     if (
//       !window.confirm(
//         `Are you sure you want to mark this candidate as ${status.toUpperCase()}?`
//       )
//     ) {
//       return;
//     }
//     setError("");
//     try {
//       await axios.post(
//         `${backendUrl}/api/form/update-status/${id}`,
//         { hr_status: status }
//       );
//       alert(
//         `Candidate marked as ${
//           status.charAt(0).toUpperCase() + status.slice(1)
//         }.`
//       );
//       fetchData(); // Refresh data to update lists
//     } catch (err) {
//       setError("Failed to update candidate status. Please try again.");
//       console.error("Status update failed:", err);
//     }
//   };

//   const renderCustomAnswers = (answers) => {
//     if (!answers || Object.keys(answers).length === 0) {
//       return <span className="text-gray-500">N/A</span>;
//     }
//     return (
//       <div className="space-y-1">
//         {Object.entries(answers).map(([q, a]) => (
//           <div key={q} className="text-sm">
//             <strong className="text-gray-700">{q}</strong>:{" "}
//             <span className="text-gray-600">{a}</span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const renderTable = (title, list, showActions = false) => (
//     <div className="mb-8 bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-100">
//       <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
//       {list.length === 0 ? (
//         <p className="text-center text-gray-600 py-4">
//           No candidates in this list.
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
//             <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
//               <tr>
//                 <th
//                   scope="col"
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                 >
//                   Name
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                 >
//                   Email
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                 >
//                   Phone
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                 >
//                   Score
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                 >
//                   Resume
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                 >
//                   Summary
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                 >
//                   Custom Answers
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                 >
//                   Why Shortlisted
//                 </th>
//                 {showActions && (
//                   <th
//                     scope="col"
//                     className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                   >
//                     Actions
//                   </th>
//                 )}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {list.map((c) => (
//                 <tr key={c.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {c.name}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                     {c.email}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                     {c.phone || <span className="text-gray-500">N/A</span>}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                     {c.ats_score || <span className="text-gray-500">N/A</span>}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-sm">
//                     {c.resume_url ? (
//                       <a
//                         className="text-blue-600 hover:text-blue-800 underline transition-colors"
//                         href={c.resume_url}
//                         target="_blank"
//                         rel="noreferrer"
//                       >
//                         View Resume
//                       </a>
//                     ) : (
//                       <span className="text-gray-500">N/A</span>
//                     )}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">
//                     {c.summary || <span className="text-gray-500">N/A</span>}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700">
//                     {renderCustomAnswers(c.custom_answers)}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">
//                     {c.shortlisting_reason || (
//                       <span className="text-gray-500">—</span>
//                     )}
//                   </td>
//                   {showActions && (
//                     <td className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium space-x-2">
//                       <button
//                         className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
//                         onClick={() => handleStatusUpdate(c.id, "shortlisted")}
//                         title="Shortlist Candidate"
//                       >
//                         <svg
//                           className="-ml-0.5 mr-1 h-4 w-4"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                             clipRule="evenodd"
//                           ></path>
//                         </svg>
//                         Shortlist
//                       </button>
//                       <button
//                         className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
//                         onClick={() => handleStatusUpdate(c.id, "rejected")}
//                         title="Reject Candidate"
//                       >
//                         <svg
//                           className="-ml-0.5 mr-1 h-4 w-4"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                             clipRule="evenodd"
//                           ></path>
//                         </svg>
//                         Reject
//                       </button>
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   const handleOpenMail = () => {
//     if (!shortlisted.length) {
//       alert("No HR Shortlisted candidates to email.");
//       return;
//     }
//     if (!job?.team_lead_email) {
//       alert("Team Lead email not available for this job.");
//       return;
//     }

//     const subject = `HR Shortlisted Candidates: ${job.position} | ${job.team}`;
//     const to = job.team_lead_email;
//     const body = shortlisted
//       .map(
//         (c, i) => `
// ${i + 1}. ${c.name}
// • Email: ${c.email}
// • Score: ${c.ats_score || "N/A"}
// • Summary: ${c.summary || "N/A"}
// • Resume: ${c.resume_url || "N/A"}
// ${c.shortlisting_reason ? `• Reason: ${c.shortlisting_reason}` : ""}
// ------------------------------`
//       )
//       .join("\n");
//     const mailtoLink = `mailto:${encodeURIComponent(
//       to
//     )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
//     window.open(mailtoLink);
//   };

//   if (loading && !job) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
//         <div className="text-center text-gray-700 font-semibold text-xl">
//           <svg
//             className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             ></circle>
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             ></path>
//           </svg>
//           Loading Candidates...
//         </div>
//         {/* Background decoration */}
//         <div className="absolute inset-0 overflow-hidden -z-10">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
//           <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
//         <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center shadow-md">
//           <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
//             <path
//               fillRule="evenodd"
//               d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
//               clipRule="evenodd"
//             />
//           </svg>
//           <span className="font-medium">{error}</span>
//         </div>
//         {/* Background decoration */}
//         <div className="absolute inset-0 overflow-hidden -z-10">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
//           <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">
//       {/* Background decoration */}
//       <div className="absolute inset-0 overflow-hidden -z-10">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//       </div>

//       <div className="relative max-w-7xl w-full">
//         <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100 mb-10">
//           <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//             Candidates for: {job?.position} ({job?.team})
//           </h2>

//           <div className="flex flex-wrap justify-center gap-4 mb-8">
//             <button
//               className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
//               onClick={handleOpenMail}
//               disabled={shortlisted.length === 0}
//             >
//               <svg
//                 className="-ml-1 mr-3 h-5 w-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0-8V4m0 8h.01M12 4l.707.707A1 1 0 0112.707 6H12v-.293l-.707.707M7 8h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z"
//                 ></path>
//               </svg>
//               Email Shortlisted to Team Leader
//             </button>
//           </div>
//         </div>

//         {renderTable(
//           "Filtered Candidates (ATS Shortlisted - HR Review Pending)",
//           filtered,
//           true
//         )}
//         {renderTable("HR Shortlisted Candidates", shortlisted)}

//         <div className="flex justify-center mb-8">
//           <button
//             className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 transform hover:scale-[1.02]"
//             onClick={() => setShowRejected(!showRejected)}
//           >
//             {showRejected ? (
//               <>
//                 <svg
//                   className="-ml-1 mr-3 h-5 w-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                   ></path>
//                 </svg>
//                 Hide Rejected Candidates
//               </>
//             ) : (
//               <>
//                 <svg
//                   className="-ml-1 mr-3 h-5 w-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                   ></path>
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                   ></path>
//                 </svg>
//                 View Rejected Candidates ({rejected.length})
//               </>
//             )}
//           </button>
//         </div>
//         {showRejected && renderTable("HR Rejected Candidates", rejected)}

//         <div className="flex justify-center mb-8">
//           <button
//             className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 transform hover:scale-[1.02]"
//             onClick={() => setShowAtsRejected(!showAtsRejected)}
//           >
//             {showAtsRejected ? (
//               <>
//                 <svg
//                   className="-ml-1 mr-3 h-5 w-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7..."
//                   />
//                 </svg>
//                 Hide ATS Rejected Candidates
//               </>
//             ) : (
//               <>
//                 <svg
//                   className="-ml-1 mr-3 h-5 w-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M2.458 12C3.732 7.943 7.523 5 12 5..."
//                   />
//                 </svg>
//                 View ATS Rejected Candidates ({atsRejected.length})
//               </>
//             )}
//           </button>
//         </div>
//         {showAtsRejected && renderTable("ATS Rejected Candidates (Score < 70)", atsRejected)}

//       </div>

//       {/* Custom styles for animations */}
//       <style> ` ` </style>
//     </div>
//   );
// };

// export default CandidateViewer;
