// HoldPool.jsx - Centralized hold candidates management
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Icons
const UserGroupIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
  </svg>
);

const BriefcaseIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v6.75a3 3 0 01-3 3H4.25a3 3 0 01-3-3V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-6 0v-.09a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5z" clipRule="evenodd" />
  </svg>
);

const ArrowRightIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
  </svg>
);

const HoldPool = () => {
  const [heldCandidates, setHeldCandidates] = useState([]);
  const [availableJobs, setAvailableJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [movingCandidate, setMovingCandidate] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(""); // Filter by team
  const navigate = useNavigate();

  const fetchHoldData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all held candidates
      const heldRes = await axios.get(`${backendUrl}/api/candidates/held`);
      const held = heldRes.data || [];
      setHeldCandidates(held);

      // Fetch available jobs grouped by team
      const jobsRes = await axios.get(`${backendUrl}/api/jobs`);
      const jobs = jobsRes.data || [];
      
      // Group jobs by team (only open jobs)
      const jobsByTeam = {};
      jobs
        .filter(job => job.status === "open" && !job.hidden)
        .forEach(job => {
          if (!jobsByTeam[job.team]) {
            jobsByTeam[job.team] = [];
          }
          jobsByTeam[job.team].push(job);
        });
      
      setAvailableJobs(jobsByTeam);
    } catch (err) {
      setError("Failed to fetch held candidates data.");
      console.error("Fetch hold data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldData();
  }, []);

  const moveToJob = async (candidateId, jobId, candidateName, jobPosition) => {
    const confirmMove = window.confirm(
      `Move ${candidateName} to "${jobPosition}" shortlisted candidates?\n\nThis will change their status from Hold to Shortlisted for the selected job.`
    );

    if (!confirmMove) return;

    setMovingCandidate(candidateId);
    setError("");
    setSuccessMessage("");

    try {
      await axios.post(`${backendUrl}/api/candidates/move-to-job`, {
        candidateId,
        newJobId: jobId,
        hr_status: "shortlisted"
      });

      setSuccessMessage(`${candidateName} moved to "${jobPosition}" successfully!`);
      fetchHoldData(); // Refresh data
    } catch (err) {
      setError("Failed to move candidate. Please try again.");
      console.error("Move candidate error:", err);
    } finally {
      setMovingCandidate(null);
    }
  };

  const renderCandidateCard = (candidate) => {
    const teamJobs = availableJobs[candidate.originalTeam] || [];
    
    return (
      <div key={candidate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        {/* Candidate Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{candidate.name}</h3>
              <p className="text-sm text-blue-600 hover:underline mb-1">
                <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
              </p>
              <p className="text-sm text-gray-500 mb-2">{candidate.phone || "N/A"}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-1" />
                  {candidate.originalTeam}
                </span>
                <span className="flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-1" />
                  {candidate.originalPosition}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-sm font-bold">
                {candidate.ats_score || "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">ATS Score</p>
            </div>
          </div>
        </div>

        {/* Available Jobs */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Available {candidate.originalTeam} Jobs:
          </h4>
          {teamJobs.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No open jobs available for this team.</p>
          ) : (
            <div className="space-y-2">
              {teamJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{job.position}</p>
                    <p className="text-xs text-gray-500">{job.team}</p>
                  </div>
                  <button
                    onClick={() => moveToJob(candidate.id, job.id, candidate.name, job.position)}
                    disabled={movingCandidate === candidate.id}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {movingCandidate === candidate.id ? (
                      "Moving..."
                    ) : (
                      <>
                        Move Here
                        <ArrowRightIcon className="ml-1" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resume Link */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          {candidate.resume_url ? (
            <a
              href={candidate.resume_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              📄 View Resume
            </a>
          ) : (
            <span className="text-sm text-gray-500">Resume not available</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hold pool...</p>
        </div>
      </div>
    );
  }

  // Get unique teams from held candidates
  const availableTeams = [...new Set(heldCandidates.map(candidate => candidate.originalTeam))].sort();
  
  // Filter candidates by selected team
  const filteredCandidates = selectedTeam 
    ? heldCandidates.filter(candidate => candidate.originalTeam === selectedTeam)
    : heldCandidates;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Candidate Hold Pool
                </h1>
                <p className="text-lg text-gray-600">
                  Manage candidates on hold and move them to available positions
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Back
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <UserGroupIcon className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-900">{heldCandidates.length}</p>
                    <p className="text-sm text-yellow-700">Total Candidates on Hold</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <BriefcaseIcon className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {Object.values(availableJobs).flat().length}
                    </p>
                    <p className="text-sm text-green-700">Available Jobs</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <UserGroupIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {selectedTeam ? filteredCandidates.length : availableTeams.length}
                    </p>
                    <p className="text-sm text-blue-700">
                      {selectedTeam ? `${selectedTeam} Candidates` : "Active Teams"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="team-filter" className="text-sm font-medium text-gray-700">
                  Filter by Team:
                </label>
                <select
                  id="team-filter"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm min-w-[200px]"
                >
                  <option value="">All Teams ({heldCandidates.length} candidates)</option>
                  {availableTeams.map(team => {
                    const teamCount = heldCandidates.filter(c => c.originalTeam === team).length;
                    return (
                      <option key={team} value={team}>
                        {team} ({teamCount} candidates)
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                {selectedTeam ? (
                  <>
                    Showing <span className="font-semibold">{filteredCandidates.length}</span> candidates from{" "}
                    <span className="font-semibold">{selectedTeam}</span> team
                  </>
                ) : (
                  <>
                    Showing <span className="font-semibold">all {heldCandidates.length}</span> candidates across{" "}
                    <span className="font-semibold">{availableTeams.length}</span> teams
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Hold Candidates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedTeam ? `${selectedTeam} Team Candidates` : "All Candidates Available for Placement"}
            </h2>
          </div>
          
          <div className="p-6">
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedTeam ? `No ${selectedTeam} candidates on hold` : "No candidates on hold"}
                </h3>
                <p className="text-gray-500">
                  {selectedTeam 
                    ? `No candidates from ${selectedTeam} team are currently on hold.`
                    : "Candidates marked as \"Hold\" will appear here for placement into available jobs."
                  }
                </p>
                {selectedTeam && (
                  <button
                    onClick={() => setSelectedTeam("")}
                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View all teams
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCandidates.map(renderCandidateCard)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoldPool;
