import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const CandidateViewer = () => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleAutoScore = async () => {
    if (
      !window.confirm(
        "This will scan and update all pending candidates. Proceed?"
      )
    )
      return;
    try {
      await axios.post(`${backendUrl}/api/n8n/score-candidates`);
      alert("Scoring complete. Reloading...");
      fetchData(); // refresh data
    } catch (err) {
      alert("Scoring failed");
      console.error(err);
    }
  };

  const { job_id } = useParams();
  const [job, setJob] = useState(null);
  const [shortlisted, setShortlisted] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [showRejected, setShowRejected] = useState(false);

  const fetchData = async () => {
    const res = await axios.get(`${backendUrl}/api/jobs/${job_id}`);
    setJob(res.data.job);
    const candidates = res.data.candidates || [];
    // setShortlisted(candidates.filter((c) => c.status === "shortlisted"));
    setFiltered(
      candidates.filter((c) => c.status === "shortlisted" && !c.hr_status)
    );
    setShortlisted(candidates.filter((c) => c.hr_status === "shortlisted"));
    setRejected(candidates.filter((c) => c.hr_status === "rejected"));
  };

  useEffect(() => {
    fetchData();
  }, [job_id]);

  const renderCustomAnswers = (answers) => {
    return answers
      ? Object.entries(answers).map(([q, a]) => (
          <div key={q}>
            <strong>{q}</strong>: {a}
          </div>
        ))
      : "N/A";
  };

  const handleStatusUpdate = async (id, status) => {
    const confirmMsg = `Are you sure you want to mark this candidate as ${status.toUpperCase()}? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.post(`${backendUrl}/api/form/update-status/${id}`, {
        hr_status: status,
      });
      alert(`Candidate marked as ${status}`);
      fetchData(); // Refresh candidate lists
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update candidate status");
    }
  };

  const renderTable = (title, list, showActions = false) => (
    <>
      <h3>{title}</h3>
      {list.length === 0 ? (
        <p>No candidates</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Score</th>
              <th>Resume</th>
              <th>Summary</th>
              <th>Custom Answers</th>
              <th>Why Shortlisted</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || "N/A"}</td>
                <td>{c.ats_score || "N/A"}</td>
                <td>
                  <a href={c.resume_url} target="_blank" rel="noreferrer">
                    View Resume
                  </a>
                </td>
                <td>{c.summary || "N/A"}</td>
                <td>{renderCustomAnswers(c.custom_answers)}</td>
                <td>{c.shortlisting_reason || "—"}</td>

                {showActions && (
                  <td>
                    <button
                      onClick={() => handleStatusUpdate(c.id, "shortlisted")}
                    >
                      ✅ Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(c.id, "rejected")}
                      style={{ marginLeft: "8px", color: "red" }}
                    >
                      ❌ Reject
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );

  const handleOpenMail = () => {
    if (!shortlisted.length) return alert("No shortlisted candidates found.");

    const subject = `HR Shortlisted Candidates : ${job.position} | ${job.team}`;
    const to = job?.team_lead_email;
    if (!to) return;

    const body = shortlisted
      .map(
        (c, i) => `
  ${i + 1}. ${c.name}
  • Email: ${c.email}
  • Score: ${c.ats_score}
  • Summary: ${c.summary}
  • Resume: ${c.resume_url}
  ------------------------------`
      )
      .join("\n");

    const mailtoLink = `mailto:${encodeURIComponent(
      to
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(mailtoLink);
  };

  return (
    <div className="candidate-viewer">
      <h2>{job?.position} – Candidates</h2>
      <button onClick={handleAutoScore}>⚙️ Auto Score All Pending</button>

      {/* Only render the Shortlisted table */}
      {/* {renderTable("Shortlisted Candidates", shortlisted)} */}
      {renderTable("Filtered Candidates (ATS Shortlisted)", filtered, true)}
      {renderTable("HR Shortlisted", shortlisted)}
      <button
        onClick={() => setShowRejected(!showRejected)}
        style={{ marginTop: "16px", marginBottom: "12px" }}
      >
        {showRejected
          ? "🙈 Hide Rejected Candidates"
          : "👁️ View Rejected Candidates"}
      </button>
      {showRejected && renderTable("Rejected Candidates", rejected)}

      {/* {renderTable("Rejected", rejected)} */}

      <button onClick={handleOpenMail} style={{ marginBottom: "16px" }}>
        📤 Email Shortlisted to Team Leader
      </button>
    </div>
  );
};

export default CandidateViewer;
