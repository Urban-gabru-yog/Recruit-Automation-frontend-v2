// Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import JDGenerator from "./JDGenerator"; // Assuming JDGenerator is a separate component
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Dashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [team, setTeam] = useState("");
  const [position, setPosition] = useState("");
  const [jd, setJD] = useState("");
  const [customQuestions, setCustomQuestions] = useState([
    { label: "", name: "" },
  ]);
  const [teamLeadEmail, setTeamLeadEmail] = useState("");
  const [selectedJD, setSelectedJD] = useState("");
  const [showJDModal, setShowJDModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      console.log("backendUrl =", backendUrl);
      try {
        const res = await axios.get(`${backendUrl}/api/jobs`);
        console.log("📦 Response from /api/jobs:", res.data);
        // setJobs(res.data);
        if (Array.isArray(res.data)) {
          setJobs(res.data);
        } else {
          console.error("❌ Expected array but got:", res.data);
          setJobs([]); // prevent crash
        }
      } catch (err) {
        setError("Failed to fetch job listings.");
      }
    };
    fetchJobs();
  }, []);

  const createJob = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!jd || jd.trim().length < 20) {
      setError("⚠️ JD is missing or incomplete. Please generate it first.");
      setIsLoading(false);
      return;
    }

    const validQuestions = customQuestions.filter(
      (q) => q.label && q.label.trim().length > 0
    );

    if (validQuestions.length === 0) {
      setError("⚠️ Please add at least one custom question.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/jobs/create`,
        {
          team,
          position,
          jd,
          custom_questions: validQuestions,
          team_lead_email: teamLeadEmail,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const refreshed = await axios.get(`${backendUrl}/api/jobs`);
      setJobs(refreshed.data);
      if (res.data.form_link) {
        setSuccessMessage(`Job created! Form URL: ${res.data.form_link}`);
      } else {
        setSuccessMessage("Job created, but form link was not received.");
      }

      // Clear form
      setTeam("");
      setPosition("");
      setJD("");
      setCustomQuestions([{ label: "", name: "" }]);
      setTeamLeadEmail("");
    } catch (err) {
      setError("Failed to create job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeJob = async (id) => {
    const confirmClose = window.confirm(
      "⚠️ Are you sure you want to close this job post?\n\nThis action cannot be undone."
    );

    if (!confirmClose) return;

    setError("");
    setSuccessMessage("");
    try {
      await axios.post(
        `${backendUrl}/api/jobs/close/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setJobs(jobs.map((j) => (j.id === id ? { ...j, status: "closed" } : j)));
      setSuccessMessage("Job form closed successfully!");
    } catch (err) {
      setError("Failed to close job. Please try again.");
    }
  };

  const copyJDToClipboard = (jdText) => {
    navigator.clipboard.writeText(jdText);
    setSuccessMessage("JD copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">
      {/* Background decoration - Reusing blob animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-5xl w-full">
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100 mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Welcome, {user.role}!
          </h2>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-6"
              role="alert"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center mb-6"
              role="alert"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {user.role === "team" && (
            <div className="job-creator space-y-6">
              <h3 className="text-2xl font-semibold text-gray-700 text-center mb-6">
                Create New Job Opening
              </h3>

              <div>
                <label
                  htmlFor="team-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Team
                </label>
                <select
                  id="team-select"
                  onChange={(e) => setTeam(e.target.value)}
                  value={team}
                  className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value="">Choose Team</option>
                  <option value="Tech">Tech</option>
                  <option value="Sales">Sales</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Influencer Marketing">
                    Influencer Marketing
                  </option>
                  <option value="Operations">Operations</option>
                  <option value="Creative">Creative</option>
                  <option value="Video">Video</option>
                  <option value="Content">Content</option>
                  <option value="E-Comm Marketing">E-Comm Marketing</option>
                  <option value="Offline Sales">Offline Sales</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Position Title
                </label>
                <input
                  id="position"
                  type="text"
                  placeholder="e.g., Senior Software Engineer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Questions for Applicants
                </label>

                {customQuestions.map((q, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <span className="text-gray-600 font-semibold">
                      Q{i + 1}:
                    </span>
                    <input
                      placeholder="e.g., Why do you want this role?"
                      value={q.label}
                      onChange={(e) => {
                        const updated = [...customQuestions];
                        updated[i].label = e.target.value;
                        updated[i].name = `q${i + 1}`;
                        setCustomQuestions(updated);
                      }}
                      className={`flex-grow px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        q.label.trim() === ""
                          ? "border-red-400 ring-red-200 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 bg-gray-50 hover:bg-white"
                      }`}
                    />
                    {customQuestions.length > 1 && (
                      <button
                        onClick={() =>
                          setCustomQuestions(
                            customQuestions.filter((_, idx) => idx !== i)
                          )
                        }
                        className="p-2 text-red-500 hover:text-red-700 rounded-full transition-colors"
                        title="Remove question"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() =>
                    setCustomQuestions([
                      ...customQuestions,
                      { label: "", name: "" },
                    ])
                  }
                  className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.01]"
                >
                  Add Custom Question
                </button>
              </div>

              <JDGenerator
                team={team}
                position={position}
                onGenerate={(text) => {
                  setJD(text);
                }}
              />

              <div>
                <label
                  htmlFor="job-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  placeholder="Generate JD using the button above, or paste it here."
                  value={jd}
                  onChange={(e) => setJD(e.target.value)}
                  rows="8"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-y"
                />
                {jd && jd.trim().length >= 20 && (
                  <p className="text-green-600 text-sm mt-2">
                    ✅ JD ready to submit!
                  </p>
                )}
                {jd && jd.trim().length < 20 && (
                  <p className="text-orange-500 text-sm mt-2">
                    JD is too short. Please generate or enter a more complete
                    description.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="team-lead-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Team Lead Email
                </label>
                <input
                  id="team-lead-email"
                  type="email"
                  placeholder="teamlead@example.com"
                  value={teamLeadEmail}
                  onChange={(e) => setTeamLeadEmail(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              <button
                onClick={createJob}
                disabled={
                  isLoading ||
                  !jd ||
                  jd.trim().length < 20 ||
                  !team ||
                  !position ||
                  !teamLeadEmail ||
                  customQuestions.filter(
                    (q) => q.label && q.label.trim().length > 0
                  ).length === 0
                }
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Job...
                  </span>
                ) : (
                  "Create Job"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Job Listings Table */}
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
            Current Job Listings
          </h3>
          {jobs.length === 0 ? (
            <p className="text-center text-gray-600">
              No job listings available.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Team
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Position
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Form Link
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      JD Actions
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {job.team}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {job.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            job.status === "open"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                        {job.form_link ? (
                          <a
                            href={job.form_link}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            Open Form
                          </a>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedJD(job.jd);
                            setShowJDModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                          title="Preview Job Description"
                        >
                          👁️ Preview
                        </button>

                        {/* <button
                          onClick={() => copyJDToClipboard(job.jd)}
                          className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                          title="Copy Job Description"
                        >
                          📋 Copy JD
                        </button> */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {user.role === "hr" && (
                          <a
                            href={`/candidates/${job.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <button className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors">
                              View Candidates
                            </button>
                          </a>
                        )}
                        {user.role === "hr" && job.status === "open" && (
                          <button
                            onClick={() => closeJob(job.id)}
                            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                          >
                            Close Form
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* JD Preview Modal */}
      {showJDModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              📄 Job Description Preview
            </h3>
            <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
              {selectedJD}
            </pre>
            <button
              onClick={() => setShowJDModal(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.01]"
            >
              ❌ Close
            </button>
          </div>
        </div>
      )}

      {/* Re-add custom styles for animations */}
      <style> `` </style>
    </div>
  );
};

export default Dashboard;
