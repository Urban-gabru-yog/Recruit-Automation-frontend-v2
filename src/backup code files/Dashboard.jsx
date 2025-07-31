// === Updated Dashboard.jsx with Position Text Field ===
import React, { useEffect, useState } from "react";
import axios from "axios";
import JDGenerator from "./JDGenerator";

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

  useEffect(() => {
    axios
      .get("https://recruit-automation-backend-v2.onrender.com/api/jobs")
      .then((res) => setJobs(res.data));
  }, []);

  const createJob = async () => {
    console.log("📤 Final JD at submit time:", jd);
    if (!jd || jd.trim().length < 20) {
      alert("⚠️ JD is missing or incomplete. Please generate it first.");
      return;
    }
    const res = await axios.post(
      "https://recruit-automation-backend-v2.onrender.com/api/jobs/create",
      {
        team,
        position,
        jd,
        custom_questions: customQuestions,
        team_lead_email: teamLeadEmail,
      },
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );
    // setJobs([...jobs, res.data]);
    const refreshed = await axios.get("https://recruit-automation-backend-v2.onrender.com/api/jobs");
    setJobs(refreshed.data);
    if (res.data.form_link) {
      alert(`Job created! Form URL: ${res.data.form_link}`);
    } else {
      alert("Job created, but form link was not received.");
    }
  };

  const closeJob = async (id) => {
    await axios.post(
      `https://recruit-automation-backend-v2.onrender.com/api/jobs/close/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );
    setJobs(jobs.map((j) => (j.id === id ? { ...j, status: "closed" } : j)));
  };

  return (
    <div className="dashboard">
      <h2>Welcome, {user.role}</h2>

      {user.role === "team" && (
        <div className="job-creator">
          <select onChange={(e) => setTeam(e.target.value)}>
            <option>Choose Team</option>
            <option value="Tech">Tech</option>
            <option value="Sales">Sales</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Influencer Marketing">Influencer Marketing</option>
            <option value="Operations">Operations</option>
            <option value="Creative">Creative</option>
            <option value="Video">Video</option>
            <option value="Content">Content</option>
            <option value="E-Comm Marketing">E-Comm Marketing</option>
            <option value="Offline Sales">Offline Sales</option>
          </select>

          <input
            type="text"
            placeholder="Enter Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />

          {customQuestions.map((q, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <label>
                <strong>Question {i + 1}</strong>
              </label>
              <input
                placeholder="e.g. Why do you want this role?"
                value={q.label}
                onChange={(e) => {
                  const updated = [...customQuestions];
                  updated[i].label = e.target.value;
                  updated[i].name = `q${i + 1}`;
                  setCustomQuestions(updated);
                }}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
          ))}
          <button
            onClick={() =>
              setCustomQuestions([...customQuestions, { label: "", name: "" }])
            }
          >
            ➕ Add Question
          </button>

          <JDGenerator
            team={team}
            position={position}
            onGenerate={(text) => {
              console.log("🔁 JD received from generator:", text); // add this
              setJD(text);
            }}
          />

          <textarea
            placeholder="Click above button first!"
            value={jd}
            onChange={(e) => setJD(e.target.value)}
          />
          {jd && <p style={{ color: "green" }}>✅ JD ready to submit!</p>}

          <input
            type="email"
            placeholder="Team Lead Email"
            value={teamLeadEmail}
            onChange={(e) => setTeamLeadEmail(e.target.value)}
            style={{ width: "100%", marginTop: "10px" }}
          />

          <button onClick={createJob} disabled={!jd || jd.trim().length < 20}>
            Create Job
          </button>
        </div>
      )}

      <h3>Job Listings</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Team</th>
            <th>Position</th>
            <th>Status</th>
            <th>Form Link</th>
            <th>JD</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.team}</td>
              <td>{job.position}</td>
              <td>{job.status}</td>
              <td>
                {job.form_link ? (
                  <>
                    <a href={job.form_link} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </>
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                <button
                  onClick={() => {
                    setSelectedJD(job.jd);
                    setShowJDModal(true);
                  }}
                >
                  👁️ Preview
                </button>

                <button
                  style={{ marginLeft: "6px" }}
                  onClick={() => {
                    navigator.clipboard.writeText(job.jd);
                    alert("JD copied to clipboard!");
                  }}
                >
                  📋 Copy JD
                </button>
              </td>

              <td>
                {user.role === "hr" && job.status === "open" && (
                  <button onClick={() => closeJob(job.id)}>Close Job Form</button>
                )}
                {user.role === "hr" && (
                  <a href={`/candidates/${job.id}`} target="_blank">
                    <button>View Candidates</button>
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showJDModal && (
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            padding: "20px",
            maxWidth: "600px",
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: 9999,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            borderRadius: "8px",
          }}
        >
          <h3>📄 Job Description</h3>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>
            {selectedJD}
          </pre>
          <button
            onClick={() => setShowJDModal(false)}
            style={{ marginTop: "12px" }}
          >
            ❌ Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
