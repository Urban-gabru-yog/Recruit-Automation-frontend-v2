import React, { useState } from "react";
import axios from "axios";

const JDGenerator = ({ team, position, onGenerate }) => {
  const [responsibilities, setResponsibilities] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  // const [location, setLocation] = useState("Hinjawadi, Pune");
  const [loading, setLoading] = useState(false);

  // Check if all fields are filled
  const isFormComplete =
    responsibilities.trim() &&
    skills.trim() &&
    experience.trim();
    // location.trim();

  const generateJD = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        " https://recruit-automation-backend-v2.onrender.com/api/n8n/generate-jd",
        {
          team,
          position,
          responsibilities,
          skills,
          experience,
        }
      );
      onGenerate(res.data.jd);
    } catch (err) {
      alert("JD generation failed");
    }
    setLoading(false);
  };

  return (
    <div className="jd-generator">
      <div style={{ marginBottom: "12px" }}>
        <label>
          <strong>Key Responsibilities</strong>
        </label>
        <textarea
          placeholder="Describe responsibilities..."
          onChange={(e) => setResponsibilities(e.target.value)}
          style={{ width: "100%", marginTop: "4px" }}
        />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label>
          <strong>Skills Needed</strong>
        </label>
        <textarea
          placeholder="List essential skills..."
          onChange={(e) => setSkills(e.target.value)}
          style={{ width: "100%", marginTop: "4px" }}
        />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label>
          <strong>Experience</strong>
        </label>
        <input
          placeholder="e.g. 2+ years"
          onChange={(e) => setExperience(e.target.value)}
          style={{ width: "100%", marginTop: "4px" }}
        />
      </div>

      <button onClick={generateJD} disabled={loading || !isFormComplete}>
        {loading ? "Generating..." : "Generate JD"}
      </button>
    </div>
  );
};

export default JDGenerator;

// import React, { useState } from 'react';
// import axios from 'axios';

// const JDGenerator = ({ team, position, onGenerate }) => {
//   const [responsibilities, setResponsibilities] = useState('');
//   const [skills, setSkills] = useState('');
//   const [experience, setExperience] = useState('');
//   const [location, setLocation] = useState('Hinjawadi, Pune');
//   const [loading, setLoading] = useState(false);

//   const generateJD = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post('/api/n8n/generate-jd', {
//         team,
//         position,
//         responsibilities,
//         skills,
//         experience,
//         location,
//       });
//       onGenerate(res.data.jd);
//     } catch (err) {
//       alert('JD generation failed');
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="jd-generator">
//       <div style={{ marginBottom: '12px' }}>
//         <label><strong>Key Responsibilities</strong></label>
//         <textarea
//           placeholder="Describe responsibilities..."
//           onChange={(e) => setResponsibilities(e.target.value)}
//           style={{ width: '100%', marginTop: '4px' }}
//         />
//       </div>

//       <div style={{ marginBottom: '12px' }}>
//         <label><strong>Skills Needed</strong></label>
//         <textarea
//           placeholder="List essential skills..."
//           onChange={(e) => setSkills(e.target.value)}
//           style={{ width: '100%', marginTop: '4px' }}
//         />
//       </div>

//       <div style={{ marginBottom: '12px' }}>
//         <label><strong>Experience</strong></label>
//         <input
//           placeholder="e.g. 2+ years"
//           onChange={(e) => setExperience(e.target.value)}
//           style={{ width: '100%', marginTop: '4px' }}
//         />
//       </div>

//       <div style={{ marginBottom: '12px' }}>
//         <label><strong>Location</strong></label>
//         <input
//           value={location}
//           placeholder="e.g. Pune / Remote"
//           onChange={(e) => setLocation(e.target.value)}
//           style={{ width: '100%', marginTop: '4px' }}
//         />
//       </div>

//       <button onClick={generateJD} disabled={loading}>
//         {loading ? 'Generating...' : 'Generate JD'}
//       </button>
//     </div>
//   );
// };

// export default JDGenerator;
