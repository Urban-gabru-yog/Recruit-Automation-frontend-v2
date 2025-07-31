import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const HiringForm = () => {
  const { job_id } = useParams();
  const [job, setJob] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    willingToRelocate: "",
  });
  const [customQuestions, setCustomQuestions] = useState([]);
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3001/api/jobs/${job_id}`).then((res) => {
      const jobData = res.data.job;

      if (jobData.status === "closed") {
        setIsClosed(true); // 👈 this triggers a re-render
      } else {
        setJob(jobData);
        setCustomQuestions(jobData.custom_questions || []);
      }
    });
  }, [job_id]);

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleResumeUpload = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("email", formValues.email);
      formData.append("phone", formValues.phone);
      customQuestions.forEach((q) => {
        formData.append(`custom_${q.label}`, formValues[q.name]);
      });
      formData.append("custom_Willing to relocate to Pune", formValues.willingToRelocate);

      formData.append("resume", resume);
      formData.append("job_id", job_id);
      formData.append("team", job.team);
      formData.append("position", job.position);

      await axios.post("http://localhost:3001/api/form/submit", formData);
      alert("Application submitted!");
      setFormValues({ name: "", email: "", phone: "" });
      setResume(null);
    } catch (err) {
      alert("Submission failed");
    }
    setSubmitting(false);
  };

  if (isClosed)
    return <p>This job posting is now closed. Thank you for your interest.</p>;
  if (!job) return <p>Loading job info...</p>;

  return (
    <div className="hiring-form">
      <h2>
        Apply for {job.position} - {job.team}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <label>
            <strong>Your Name</strong>
          </label>
          <input
            name="name"
            placeholder="Enter your full name"
            value={formValues.name}
            onChange={handleChange}
            required
            style={{ width: "100%", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>
            <strong>Email</strong>
          </label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formValues.email}
            onChange={handleChange}
            required
            style={{ width: "100%", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>
            <strong>Phone</strong>
          </label>
          <input
            name="phone"
            placeholder="Enter your phone number"
            value={formValues.phone}
            onChange={handleChange}
            required
            style={{ width: "100%", marginTop: "4px" }}
          />
        </div>

        {customQuestions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: "16px" }}>
            <label>
              <strong>{q.label}</strong>
            </label>
            <textarea
              name={q.name}
              placeholder="Type your answer..."
              value={formValues[q.name] || ""}
              onChange={handleChange}
              required
              style={{ width: "100%", marginTop: "4px" }}
            />
          </div>
        ))}

        <div style={{ marginBottom: "16px" }}>
          <label>
            <strong>Are you willing to relocate to Pune?</strong>
          </label>
          <select
            name="willingToRelocate"
            value={formValues.willingToRelocate}
            onChange={handleChange}
            required
            style={{ width: "100%", marginTop: "4px" }}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <input
          type="file"
          onChange={handleResumeUpload}
          accept=".pdf,.doc,.docx"
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default HiringForm;
