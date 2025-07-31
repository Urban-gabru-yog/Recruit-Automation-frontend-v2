// JDGenerator.jsx
import React, { useState } from "react";
import axios from "axios";

const JDGenerator = ({ team, position, onGenerate }) => {
  const [responsibilities, setResponsibilities] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  // Check if all required fields for JD generation are complete
  const isFormComplete = responsibilities.trim() && skills.trim() && experience.trim() && team.trim() && position.trim();

  const generateJD = async () => {
    setError(""); // Clear previous errors
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/n8n/generate-jd`, {
        team,
        position,
        responsibilities,
        skills,
        experience,
      });
      onGenerate(res.data.jd);
    } catch (err) {
      setError("Failed to generate JD. Please check your inputs and try again.");
      console.error("JD generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
      <h3 className="text-2xl font-semibold text-gray-700 text-center mb-4">Generate Job Description</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center" role="alert">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 mb-2">
          Key Responsibilities
        </label>
        <textarea
          id="responsibilities"
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-y"
          placeholder="Describe daily tasks, duties, and functions. E.g., 'Develop and maintain web applications, Collaborate with cross-functional teams, Write clean and efficient code.'"
          rows="4"
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
          Skills Needed
        </label>
        <textarea
          id="skills"
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-y"
          placeholder="List essential technical and soft skills. E.g., 'JavaScript, React, Node.js, Problem-solving, Communication.'"
          rows="4"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
          Experience Required
        </label>
        <input
          id="experience"
          type="text"
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          placeholder="e.g., '2+ years in software development' or 'Entry-level, recent graduate'"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />
      </div>
      <button
        type="button" // Important for forms not to submit on button click
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        onClick={generateJD}
        disabled={loading || !isFormComplete}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating JD...
          </span>
        ) : (
          'Generate Job Description'
        )}
      </button>
    </div>
  );
};

export default JDGenerator;

// import React, { useState } from "react";
// import axios from "axios";

// const JDGenerator = ({ team, position, onGenerate }) => {
//   const [responsibilities, setResponsibilities] = useState("");
//   const [skills, setSkills] = useState("");
//   const [experience, setExperience] = useState("");
//   // const [location, setLocation] = useState("Hinjawadi, Pune");
//   const [loading, setLoading] = useState(false);

//   // Check if all fields are filled
//   const isFormComplete =
//     responsibilities.trim() &&
//     skills.trim() &&
//     experience.trim();
//     // location.trim();

//   const generateJD = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post(
//         "/api/n8n/generate-jd",
//         {
//           team,
//           position,
//           responsibilities,
//           skills,
//           experience,
//         }
//       );
//       onGenerate(res.data.jd);
//     } catch (err) {
//       alert("JD generation failed");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="jd-generator">
//       <div style={{ marginBottom: "12px" }}>
//         <label>
//           <strong>Key Responsibilities</strong>
//         </label>
//         <textarea
//           placeholder="Describe responsibilities..."
//           onChange={(e) => setResponsibilities(e.target.value)}
//           style={{ width: "100%", marginTop: "4px" }}
//         />
//       </div>

//       <div style={{ marginBottom: "12px" }}>
//         <label>
//           <strong>Skills Needed</strong>
//         </label>
//         <textarea
//           placeholder="List essential skills..."
//           onChange={(e) => setSkills(e.target.value)}
//           style={{ width: "100%", marginTop: "4px" }}
//         />
//       </div>

//       <div style={{ marginBottom: "12px" }}>
//         <label>
//           <strong>Experience</strong>
//         </label>
//         <input
//           placeholder="e.g. 2+ years"
//           onChange={(e) => setExperience(e.target.value)}
//           style={{ width: "100%", marginTop: "4px" }}
//         />
//       </div>

//       <button onClick={generateJD} disabled={loading || !isFormComplete}>
//         {loading ? "Generating..." : "Generate JD"}
//       </button>
//     </div>
//   );
// };

// export default JDGenerator;
