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

  const renderCustomAnswers = (answers) => {
    if (!answers || Object.keys(answers).length === 0) {
      return <span className="text-gray-500">N/A</span>;
    }
    return (
      <div className="space-y-1">
        {Object.entries(answers).map(([q, a]) => (
          <div key={q} className="text-sm">
            <strong className="text-gray-700">{q}</strong>:{" "}
            <span className="text-gray-600">{a}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCandidateCard = (c, showActions = false) => (
    <div
      key={c.id}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4 transition-all duration-300 hover:shadow-lg hover:border-gray-200"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{c.name}</h4>
          <p className="text-sm text-blue-600 hover:underline">
            <a href={`mailto:${c.email}`}>{c.email}</a>
          </p>
          <p className="text-sm text-gray-500">
            {c.phone || <span className="italic">N/A</span>}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-teal-600">
            {c.ats_score || "N/A"}
          </span>
          <p className="text-sm text-gray-500">ATS Score</p>
        </div>
      </div>

      <div className="flex-grow">
        <p className="text-sm text-gray-700 font-medium mb-1">Summary</p>
        <p className="text-sm text-gray-600">
          {c.summary || <span className="italic">Not provided</span>}
        </p>
      </div>

      {c.shortlisting_reason && (
        <div>
          <p className="text-sm text-gray-700 font-medium mb-1">
            Reason for Shortlisting
          </p>
          <p className="text-sm text-gray-600">{c.shortlisting_reason}</p>
        </div>
      )}

      {c.custom_answers && Object.keys(c.custom_answers).length > 0 && (
        <div>
          <p className="text-sm text-gray-700 font-medium mb-1">
            Custom Answers
          </p>
          {renderCustomAnswers(c.custom_answers)}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        {c.resume_url ? (
          <a
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
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

        {showActions && (
          <div className="flex space-x-2">
            <button
              className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-full transition-colors duration-200"
              onClick={() => handleStatusUpdate(c.id, "shortlisted")}
              title="Shortlist Candidate"
              disabled={updatingStatus === c.id}
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-full transition-colors duration-200"
              onClick={() => handleStatusUpdate(c.id, "rejected")}
              title="Reject Candidate"
              disabled={updatingStatus === c.id}
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSection = (title, list, showActions = false, id = null) => (
    <section className="mb-12" id={id}>
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
        {title}
        <span className="text-base font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {list.length} candidates
        </span>
      </h3>
      {list.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-100 text-center text-gray-600">
          No candidates in this list.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((c) => renderCandidateCard(c, showActions))}
        </div>
      )}
    </section>
  );

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="text-center text-gray-700 font-semibold text-xl">
          <ArrowPathIcon className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          Loading Candidates...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center shadow-md">
          <XCircleIcon className="w-6 h-6 mr-3" />
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-10">
      <div className="max-w-7xl w-full">
        <header className="bg-white shadow-sm rounded-2xl p-8 mb-10 border border-gray-100">
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2">
            Candidates for: {job?.position}
          </h1>
          <p className="text-xl text-center text-gray-500 mb-6">
            ({job?.team})
          </p>

          <nav className="flex justify-center flex-wrap gap-4 mb-8">
            <a
              href="#pending-candidates"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            >
              Pending ({filtered.length})
            </a>
            <a
              href="#hr-shortlisted"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            >
              Shortlisted ({shortlisted.length})
            </a>
            <button
              onClick={() => setShowRejected(!showRejected)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            >
              {showRejected ? "Hide" : "View"} Rejected ({rejected.length})
            </button>
            <button
              onClick={() => setShowAtsRejected(!showAtsRejected)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            >
              {showAtsRejected ? "Hide" : "View"} ATS Rejected (
              {atsRejected.length})
            </button>
          </nav>

          <div className="flex justify-center">
            <button
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleOpenMail}
              disabled={shortlisted.length === 0}
            >
              <EnvelopeIcon className="-ml-1 mr-3 h-5 w-5" />
              Email Shortlisted to Team Leader
            </button>
          </div>
        </header>

        <main className="space-y-12">
          {renderSection(
            "Pending Review (ATS Shortlisted)",
            filtered,
            true,
            "pending-candidates"
          )}
          {renderSection("HR Shortlisted Candidates", shortlisted, false, "hr-shortlisted")}
          {showRejected &&
            renderSection("HR Rejected Candidates", rejected, false)}
          {showAtsRejected &&
            renderSection("ATS Rejected Candidates (Score < 70)", atsRejected, false)}
        </main>
      </div>
    </div>
  );
};

export default CandidateViewer;