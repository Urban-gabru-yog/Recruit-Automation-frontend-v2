// CandidateViewer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const CandidateViewer = () => {
  const { job_id } = useParams();
  const [job, setJob] = useState(null);
  const [shortlisted, setShortlisted] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [showRejected, setShowRejected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`https://recruit-automation-backend-v2.onrender.com/api/jobs/${job_id}`);
      setJob(res.data.job);
      const candidates = res.data.candidates || [];
      // Candidates with 'shortlisted' status from ATS, but not yet reviewed by HR
      setFiltered(candidates.filter((c) => c.status === "shortlisted" && !c.hr_status));
      // Candidates HR has officially 'shortlisted'
      setShortlisted(candidates.filter((c) => c.hr_status === "shortlisted"));
      // Candidates HR has officially 'rejected'
      setRejected(candidates.filter((c) => c.hr_status === "rejected"));
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

  const handleAutoScore = async () => {
    if (!window.confirm("This will scan and update all pending candidates. Proceed?")) {
      return;
    }
    setError('');
    setLoading(true); // Set loading for the auto-score action
    try {
      await axios.post("https://recruit-automation-backend-v2.onrender.com/api/n8n/score-candidates");
      alert("Scoring complete. Data is reloading...");
      await fetchData(); // Fetch data again after scoring
    } catch (err) {
      setError("Failed to perform auto-scoring. Please check the N8N service.");
      console.error("Auto-score failed:", err);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this candidate as ${status.toUpperCase()}?`)) {
      return;
    }
    setError('');
    try {
      await axios.post(`https://recruit-automation-backend-v2.onrender.com/api/form/update-status/${id}`, { hr_status: status });
      alert(`Candidate marked as ${status.charAt(0).toUpperCase() + status.slice(1)}.`);
      fetchData(); // Refresh data to update lists
    } catch (err) {
      setError("Failed to update candidate status. Please try again.");
      console.error("Status update failed:", err);
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
            <strong className="text-gray-700">{q}</strong>: <span className="text-gray-600">{a}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = (title, list, showActions = false) => (
    <div className="mb-8 bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      {list.length === 0 ? (
        <p className="text-center text-gray-600 py-4">No candidates in this list.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Resume</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Summary</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Custom Answers</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Why Shortlisted</th>
                {showActions && <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{c.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{c.phone || <span className="text-gray-500">N/A</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{c.ats_score || <span className="text-gray-500">N/A</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {c.resume_url ? (
                      <a className="text-blue-600 hover:text-blue-800 underline transition-colors" href={c.resume_url} target="_blank" rel="noreferrer">View Resume</a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">{c.summary || <span className="text-gray-500">N/A</span>}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{renderCustomAnswers(c.custom_answers)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">{c.shortlisting_reason || <span className="text-gray-500">—</span>}</td>
                  {showActions && (
                    <td className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium space-x-2">
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        onClick={() => handleStatusUpdate(c.id, "shortlisted")}
                        title="Shortlist Candidate"
                      >
                        <svg className="-ml-0.5 mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        Shortlist
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        onClick={() => handleStatusUpdate(c.id, "rejected")}
                        title="Reject Candidate"
                      >
                        <svg className="-ml-0.5 mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
    const body = shortlisted.map((c, i) => `
${i + 1}. ${c.name}
• Email: ${c.email}
• Score: ${c.ats_score || 'N/A'}
• Summary: ${c.summary || 'N/A'}
• Resume: ${c.resume_url || 'N/A'}
${c.shortlisting_reason ? `• Reason: ${c.shortlisting_reason}` : ''}
------------------------------`).join("\n");
    const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  if (loading && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="text-center text-gray-700 font-semibold text-xl">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Candidates...
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center shadow-md">
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl w-full">
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100 mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Candidates for: {job?.position} ({job?.team})
          </h2>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAutoScore}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scoring...
                </span>
              ) : (
                <>
                  <svg className="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Auto Score All Pending
                </>
              )}
            </button>

            <button
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleOpenMail}
              disabled={shortlisted.length === 0}
            >
              <svg className="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0-8V4m0 8h.01M12 4l.707.707A1 1 0 0112.707 6H12v-.293l-.707.707M7 8h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z"></path>
              </svg>
              Email Shortlisted to Team Leader
            </button>
          </div>
        </div>

        {renderTable("Filtered Candidates (ATS Shortlisted - HR Review Pending)", filtered, true)}
        {renderTable("HR Shortlisted Candidates", shortlisted)}

        <div className="flex justify-center mb-8">
          <button
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 transform hover:scale-[1.02]"
            onClick={() => setShowRejected(!showRejected)}
          >
            {showRejected ? (
              <>
                <svg className="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                </svg>
                Hide Rejected Candidates
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Rejected Candidates ({rejected.length})
              </>
            )}
          </button>
        </div>

        {showRejected && renderTable("HR Rejected Candidates", rejected)}
      </div>

      {/* Custom styles for animations */}
      <style> ` ` </style>
    </div>
  );
};

export default CandidateViewer;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";

// const CandidateViewer = () => {
//   const handleAutoScore = async () => {
//     if (
//       !window.confirm(
//         "This will scan and update all pending candidates. Proceed?"
//       )
//     )
//       return;
//     try {
//       await axios.post("https://recruit-automation-backend-v2.onrender.com/api/n8n/score-candidates");
//       alert("Scoring complete. Reloading...");
//       fetchData(); // refresh data
//     } catch (err) {
//       alert("Scoring failed");
//       console.error(err);
//     }
//   };

//   const { job_id } = useParams();
//   const [job, setJob] = useState(null);
//   const [shortlisted, setShortlisted] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [rejected, setRejected] = useState([]);
//   const [showRejected, setShowRejected] = useState(false);

//   const fetchData = async () => {
//     const res = await axios.get(`https://recruit-automation-backend-v2.onrender.com/api/jobs/${job_id}`);
//     setJob(res.data.job);
//     const candidates = res.data.candidates || [];
//     // setShortlisted(candidates.filter((c) => c.status === "shortlisted"));
//     setFiltered(
//       candidates.filter((c) => c.status === "shortlisted" && !c.hr_status)
//     );
//     setShortlisted(candidates.filter((c) => c.hr_status === "shortlisted"));
//     setRejected(candidates.filter((c) => c.hr_status === "rejected"));
//   };

//   useEffect(() => {
//     fetchData();
//   }, [job_id]);

//   const renderCustomAnswers = (answers) => {
//     return answers
//       ? Object.entries(answers).map(([q, a]) => (
//           <div key={q}>
//             <strong>{q}</strong>: {a}
//           </div>
//         ))
//       : "N/A";
//   };

//   const handleStatusUpdate = async (id, status) => {
//     const confirmMsg = `Are you sure you want to mark this candidate as ${status.toUpperCase()}? This action cannot be undone.`;
//     if (!window.confirm(confirmMsg)) return;

//     try {
//       await axios.post(`https://recruit-automation-backend-v2.onrender.com/api/form/update-status/${id}`, {
//         hr_status: status,
//       });
//       alert(`Candidate marked as ${status}`);
//       fetchData(); // Refresh candidate lists
//     } catch (err) {
//       console.error("Update failed", err);
//       alert("Failed to update candidate status");
//     }
//   };

//   const renderTable = (title, list, showActions = false) => (
//     <>
//       <h3>{title}</h3>
//       {list.length === 0 ? (
//         <p>No candidates</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Phone</th>
//               <th>Score</th>
//               <th>Resume</th>
//               <th>Summary</th>
//               <th>Custom Answers</th>
//               <th>Why Shortlisted</th>
//               {showActions && <th>Actions</th>}
//             </tr>
//           </thead>
//           <tbody>
//             {list.map((c) => (
//               <tr key={c.id}>
//                 <td>{c.name}</td>
//                 <td>{c.email}</td>
//                 <td>{c.phone || "N/A"}</td>
//                 <td>{c.ats_score || "N/A"}</td>
//                 <td>
//                   <a href={c.resume_url} target="_blank" rel="noreferrer">
//                     View Resume
//                   </a>
//                 </td>
//                 <td>{c.summary || "N/A"}</td>
//                 <td>{renderCustomAnswers(c.custom_answers)}</td>
//                 <td>{c.shortlisting_reason || "—"}</td>

//                 {showActions && (
//                   <td>
//                     <button
//                       onClick={() => handleStatusUpdate(c.id, "shortlisted")}
//                     >
//                       ✅ Shortlist
//                     </button>
//                     <button
//                       onClick={() => handleStatusUpdate(c.id, "rejected")}
//                       style={{ marginLeft: "8px", color: "red" }}
//                     >
//                       ❌ Reject
//                     </button>
//                   </td>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </>
//   );

//   const handleOpenMail = () => {
//     if (!shortlisted.length) return alert("No shortlisted candidates found.");

//     const subject = `HR Shortlisted Candidates : ${job.position} | ${job.team}`;
//     const to = job?.team_lead_email;
//     if (!to) return;

//     const body = shortlisted
//       .map(
//         (c, i) => `
//   ${i + 1}. ${c.name}
//   • Email: ${c.email}
//   • Score: ${c.ats_score}
//   • Summary: ${c.summary}
//   • Resume: ${c.resume_url}
//   ------------------------------`
//       )
//       .join("\n");

//     const mailtoLink = `mailto:${encodeURIComponent(
//       to
//     )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

//     window.open(mailtoLink);
//   };

//   return (
//     <div className="candidate-viewer">
//       <h2>{job?.position} – Candidates</h2>
//       <button onClick={handleAutoScore}>⚙️ Auto Score All Pending</button>

//       {/* Only render the Shortlisted table */}
//       {/* {renderTable("Shortlisted Candidates", shortlisted)} */}
//       {renderTable("Filtered Candidates (ATS Shortlisted)", filtered, true)}
//       {renderTable("HR Shortlisted", shortlisted)}
//       <button
//         onClick={() => setShowRejected(!showRejected)}
//         style={{ marginTop: "16px", marginBottom: "12px" }}
//       >
//         {showRejected
//           ? "🙈 Hide Rejected Candidates"
//           : "👁️ View Rejected Candidates"}
//       </button>
//       {showRejected && renderTable("Rejected Candidates", rejected)}

//       {/* {renderTable("Rejected", rejected)} */}

//       <button onClick={handleOpenMail} style={{ marginBottom: "16px" }}>
//         📤 Email Shortlisted to Team Leader
//       </button>
//     </div>
//   );
// };

// export default CandidateViewer;
