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

const ChevronLeftIcon = (props) => (
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
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

const ChevronRightIcon = (props) => (
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
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
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

const CalendarIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5m-18 0h18"
    />
  </svg>
);

const ClockIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckBadgeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
    />
  </svg>
);

const CandidateViewer = () => {
  const { job_id } = useParams();
  const [job, setJob] = useState(null);
  const [shortlisted, setShortlisted] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [held, setHeld] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [atsRejected, setAtsRejected] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [updatingInterview, setUpdatingInterview] = useState(null);
  // Tabs
  const [activeTab, setActiveTab] = useState("pending");
  // Search & Sort (per active tab)
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("ats_desc"); // ats_desc | ats_asc | name_asc | name_desc

  // Pagination states - now for carousel
  const [filteredIndex, setFilteredIndex] = useState(0);
  const [shortlistedIndex, setShortlistedIndex] = useState(0);
  const [rejectedIndex, setRejectedIndex] = useState(0);
  const [heldIndex, setHeldIndex] = useState(0);
  const [atsRejectedIndex, setAtsRejectedIndex] = useState(0);
  const [lastAtsScoring, setLastAtsScoring] = useState(null);
  const [itemsPerView, setItemsPerView] = useState(3);

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
      setHeld(candidates.filter((c) => c.hr_status === "hold"));
      setAtsRejected(
        candidates.filter((c) => c.status === "rejected" && !c.hr_status)
      );
    } catch (err) {
      setError("Failed to fetch candidate data. Please try again.");
      console.error("Fetch candidates error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalAtsTimestamp = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/form/latest-ats-timestamp`);
      setLastAtsScoring(res.data.timestamp);
    } catch (err) {
      console.error("Fetch global ATS timestamp error:", err);
      setLastAtsScoring(null);
    }
  };

  useEffect(() => {
    fetchData();
    fetchGlobalAtsTimestamp();
  }, [job_id]);

  // Responsive items per view: 1 (<640px), 2 (>=640px && <1024px), 3 (>=1024px)
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) return 1;
      if (w < 1024) return 2;
      return 3; // desktop and above
    };
    const update = () => setItemsPerView(compute());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Clamp carousel indices whenever layout or lists change
  useEffect(() => {
    const clamp = (idx, len) => Math.min(Math.max(0, idx), Math.max(0, len - itemsPerView));
    setFilteredIndex((i) => clamp(i, filtered.length));
    setShortlistedIndex((i) => clamp(i, shortlisted.length));
    setHeldIndex((i) => clamp(i, held.length));
    setRejectedIndex((i) => clamp(i, rejected.length));
    setAtsRejectedIndex((i) => clamp(i, atsRejected.length));
  }, [itemsPerView, filtered.length, shortlisted.length, held.length, rejected.length, atsRejected.length]);

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

  const handleInterviewStatusUpdate = async (id, interviewStatus, candidateName) => {
    const statusText = interviewStatus === "scheduled" ? "Interview Scheduled" : "Interview Taken";
    if (
      !window.confirm(
        `Mark "${candidateName}" as "${statusText}"?`
      )
    ) {
      return;
    }
    setError("");
    setUpdatingInterview(id);
    try {
      await axios.post(`${backendUrl}/api/form/update-interview-status/${id}`, {
        interview_status: interviewStatus,
      });
      alert(`Candidate interview status updated to "${statusText}".`);
      fetchData();
    } catch (err) {
      setError("Failed to update interview status. Please try again.");
      console.error("Interview status update failed:", err);
    } finally {
      setUpdatingInterview(null);
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

  const renderCandidateCard = (c, showActions = false, actionType = "default") => {
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
              {/* Status badges */}
              <div className="flex flex-wrap gap-1 mt-1">
                {c.status === "rejected" && c.hr_status === "shortlisted" && (
                  <span className="inline-block text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    Manually Shortlisted (ATS Rejected)
                  </span>
                )}
                {c.hr_status === "hold" && (
                  <span className="inline-block text-xs font-semibold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    On Hold
                  </span>
                )}
                {c.interview_status === "scheduled" && (
                  <span className="inline-flex items-center text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    Interview Scheduled
                  </span>
                )}
                {c.interview_status === "taken" && (
                  <span className="inline-flex items-center text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    <CheckBadgeIcon className="w-3 h-3 mr-1" />
                    Interview Taken
                  </span>
                )}
              </div>
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

        {/* Card Body (fixed height for consistent comparison) */}
        <div className="p-4 space-y-3">
          <div className={`${isExpanded ? 'max-h-64 overflow-auto pr-1' : 'max-h-48 overflow-hidden'} space-y-4`}>
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
                <p className="text-sm font-medium text-gray-700 mb-2">Reason</p>

                <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-md border-l-4 border-green-400 space-y-2">
                  {(() => {
                    const sentences = c.shortlisting_reason.split(". ");
                    const strength = sentences[0]?.trim();
                    const weakness = sentences.slice(1).join(". ")?.trim();

                    return (
                      <>
                        {strength && (
                          <div>
                            <strong className="text-green-700">Strength:</strong>{" "}
                            {strength}.
                          </div>
                        )}
                        {weakness && (
                          <div>
                            <strong className="text-red-700">Weakness:</strong>{" "}
                            {weakness}
                          </div>
                        )}
                      </>
                    );
                  })()}
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
          </div>

          {/* Expand/Collapse Button (always visible) */}
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

            {/* Interview Status Actions for Shortlisted Candidates */}
            {c.hr_status === "shortlisted" && (
              <div className="flex items-center gap-2">
                {!c.interview_status && (
                  <>
                    <button
                      onClick={() => handleInterviewStatusUpdate(c.id, "scheduled", c.name)}
                      disabled={updatingInterview === c.id}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingInterview === c.id ? (
                        "..."
                      ) : (
                        <>
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          Interview Scheduled
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleInterviewStatusUpdate(c.id, "taken", c.name)}
                      disabled={updatingInterview === c.id}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingInterview === c.id ? (
                        "..."
                      ) : (
                        <>
                          <CheckBadgeIcon className="w-3 h-3 mr-1" />
                          Interview Taken
                        </>
                      )}
                    </button>
                  </>
                )}
                {c.interview_status === "scheduled" && (
                  <button
                    onClick={() => handleInterviewStatusUpdate(c.id, "taken", c.name)}
                    disabled={updatingInterview === c.id}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingInterview === c.id ? (
                      "Updating..."
                    ) : (
                      <>
                        <CheckBadgeIcon className="w-3 h-3 mr-1" />
                        Interview Taken
                      </>
                    )}
                  </button>
                )}
                {c.interview_status === "taken" && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md">
                    <CheckBadgeIcon className="w-3 h-3 mr-1" />
                    Interview Complete
                  </span>
                )}
              </div>
            )}

            {/* Add Reject action for HR Shortlisted candidates */}
            {c.hr_status === "shortlisted" && showActions === false && (
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:text-white hover:bg-red-600 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  onClick={() => handleStatusUpdate(c.id, "rejected")}
                  disabled={updatingStatus === c.id}
                >
                  {updatingStatus === c.id ? "..." : "Reject"}
                </button>
              </div>
            )}

            {/* Action buttons */}
            {showActions && (
              <div className="flex gap-2">
                {actionType === "default" && (
                  <>
                    <button
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                      onClick={() => handleStatusUpdate(c.id, "shortlisted")}
                      disabled={updatingStatus === c.id}
                    >
                      {updatingStatus === c.id ? "..." : "Shortlist"}
                    </button>
                    <button
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                      onClick={() => handleStatusUpdate(c.id, "hold")}
                      disabled={updatingStatus === c.id}
                    >
                      {updatingStatus === c.id ? "..." : "Hold"}
                    </button>
                    <button
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:text-white hover:bg-red-600 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      onClick={() => handleStatusUpdate(c.id, "rejected")}
                      disabled={updatingStatus === c.id}
                    >
                      {updatingStatus === c.id ? "..." : "Reject"}
                    </button>
                  </>
                )}
                {actionType === "hold" && (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCarouselNavigation = (currentIndex, setCurrentIndex, totalItems) => {
    const maxIndex = Math.max(0, totalItems - itemsPerView);
    if (totalItems <= itemsPerView) return null;

    return (
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
          title="Previous"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, totalItems)} of {totalItems}
          </span>
          <div className="flex space-x-1">
            {Array.from({ length: Math.ceil(totalItems / itemsPerView) }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * itemsPerView)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  Math.floor(currentIndex / itemsPerView) === i
                    ? "bg-blue-600"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setCurrentIndex(Math.min(maxIndex, currentIndex + 1))}
          disabled={currentIndex >= maxIndex}
          className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
          title="Next"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  };

  const renderSection = (
    title,
    list,
    showActions = false,
    id = null,
    currentIndex = 0,
    setCurrentIndex = null,
    actionType = "default"
  ) => {
    const startIndex = currentIndex;
    const endIndex = startIndex + itemsPerView;

    return (
      <section className="mb-8" id={id} role="tabpanel" aria-labelledby={`${id}-tab`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {list.length} candidates
                </span>
                {list.length > itemsPerView && (
                  <span className="hidden sm:inline text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(endIndex, list.length)} of {list.length}
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
                {/* Carousel Container */}
                <div className="relative overflow-hidden">
                  {/* Mobile overlay chevrons */}
                  {setCurrentIndex && list.length > itemsPerView && (
                    <>
                      <button
                        type="button"
                        className="sm:hidden absolute left-1 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white"
                        aria-label="Previous candidates"
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                      >
                        <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        type="button"
                        className="sm:hidden absolute right-1 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white"
                        aria-label="Next candidates"
                        onClick={() => {
                          const maxIndex = Math.max(0, list.length - itemsPerView);
                          setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
                        }}
                        disabled={currentIndex >= Math.max(0, list.length - itemsPerView)}
                      >
                        <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)` }}
                  >
                    {list.map((candidate) => (
                      <div 
                        key={candidate.id} 
                        className="flex-shrink-0 px-3"
                        style={{ width: `${100 / itemsPerView}%` }}
                      >
                        <div className="h-full">
                          {renderCandidateCard(candidate, showActions, actionType)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Mobile showing range below carousel */}
                {list.length > itemsPerView && (
                  <div className="sm:hidden text-center text-xs text-gray-500 mt-3">
                    Showing {startIndex + 1}-{Math.min(endIndex, list.length)} of {list.length}
                  </div>
                )}

                {/* Carousel Navigation */}
                {setCurrentIndex && (
                  <div className="hidden sm:block">
                    {renderCarouselNavigation(currentIndex, setCurrentIndex, list.length)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    );
  };

  // Apply search and sort to a list for current tab view
  const applySearchSort = (list) => {
    let result = Array.isArray(list) ? [...list] : [];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((c) => {
        const name = (c.name || "").toLowerCase();
        const email = (c.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
    const scoreVal = (c) => (typeof c.ats_score === "number" ? c.ats_score : -1);
    const nameVal = (c) => (c.name || "").toLowerCase();
    switch (sortOption) {
      case "ats_asc":
        result.sort((a, b) => scoreVal(a) - scoreVal(b));
        break;
      case "name_asc":
        result.sort((a, b) => nameVal(a).localeCompare(nameVal(b)));
        break;
      case "name_desc":
        result.sort((a, b) => nameVal(b).localeCompare(nameVal(a)));
        break;
      case "ats_desc":
      default:
        result.sort((a, b) => scoreVal(b) - scoreVal(a));
        break;
    }
    return result;
  };

  // Reset carousels when search/sort change to avoid blank views
  useEffect(() => {
    setFilteredIndex(0);
    setShortlistedIndex(0);
    setHeldIndex(0);
    setRejectedIndex(0);
    setAtsRejectedIndex(0);
  }, [searchQuery, sortOption]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {job?.position}
                </h1>
                <p className="text-sm text-gray-600">Team: {job?.team}</p>
              </div>
              {/* Cron badge */}
              {lastAtsScoring && (
                <div className="flex items-center justify-center sm:justify-end">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs">
                    <ClockIcon className="w-4 h-4" />
                    Last ATS: {new Date(lastAtsScoring).toLocaleString('en-IN', {
                      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
                      timeZone: 'Asia/Kolkata'
                    })}
                  </span>
                </div>
              )}
            </div>
            {/* Tabs */}
            <div role="tablist" aria-label="Candidate categories" className="mt-3 overflow-x-auto relative">
              {/* Right-edge gradient scroll hint (mobile only) */}
              <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-10 sm:hidden" />
              <div className="inline-flex gap-2 whitespace-nowrap pr-2">
                {[
                  { key: "pending", label: "Pending", count: filtered.length, target: "pending-candidates" },
                  { key: "shortlisted", label: "Shortlisted", count: shortlisted.length, target: "hr-shortlisted" },
                  { key: "hold", label: "On Hold", count: held.length, target: "candidates-on-hold" },
                  { key: "rejected", label: "Rejected", count: rejected.length, target: "hr-rejected" },
                  { key: "atsRejected", label: "ATS Rejected", count: atsRejected.length, target: "ats-rejected" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    id={`${tab.target}-tab`}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    aria-controls={tab.target}
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      `inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ` +
                      (activeTab === tab.key
                        ? "text-white bg-blue-600"
                        : tab.key === "hold"
                        ? "text-orange-700 bg-orange-100 hover:bg-orange-200"
                        : "text-gray-700 bg-gray-100 hover:bg-gray-200")
                    }
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Removed standalone ATS timestamp card; now shown as header badge */}

        {/* Controls for the active tab */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or email..."
                className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                aria-label="Search candidates by name or email"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-option" className="text-sm text-gray-700">Sort by:</label>
              <select
                id="sort-option"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ats_desc">ATS score: High → Low</option>
                <option value="ats_asc">ATS score: Low → High</option>
                <option value="name_asc">Name: A → Z</option>
                <option value="name_desc">Name: Z → A</option>
              </select>
            </div>
            {activeTab === "shortlisted" && (
              <div className="mt-2 sm:mt-0 sm:ml-auto">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleOpenMail}
                  disabled={shortlisted.length === 0}
                >
                  <EnvelopeIcon className="mr-2 h-4 w-4" />
                  Email Shortlisted to TL
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - show only active tab */}
        <main className="space-y-8">
          {activeTab === "pending" &&
            renderSection(
              "Pending Review (ATS Shortlisted)",
              applySearchSort(filtered),
              true,
              "pending-candidates",
              filteredIndex,
              setFilteredIndex
            )}
          {activeTab === "shortlisted" &&
            renderSection(
              "HR Shortlisted Candidates",
              applySearchSort(shortlisted),
              false,
              "hr-shortlisted",
              shortlistedIndex,
              setShortlistedIndex
            )}
          {activeTab === "hold" &&
            renderSection(
              "Candidates On Hold",
              applySearchSort(held),
              true,
              "candidates-on-hold",
              heldIndex,
              setHeldIndex,
              "hold"
            )}
          {activeTab === "rejected" &&
            renderSection(
              "HR Rejected Candidates",
              applySearchSort(rejected),
              false,
              "hr-rejected",
              rejectedIndex,
              setRejectedIndex
            )}
          {activeTab === "atsRejected" &&
            renderSection(
              "ATS Rejected Candidates",
              applySearchSort(atsRejected),
              true,
              "ats-rejected",
              atsRejectedIndex,
              setAtsRejectedIndex
            )}
        </main>
      </div>
    </div>
  );
};

export default CandidateViewer;
