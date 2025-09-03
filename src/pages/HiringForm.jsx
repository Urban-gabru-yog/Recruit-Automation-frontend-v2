// HiringForm.jsx - Enhanced UI Version
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// Assuming you have an Urbangabru logo in your public folder or assets
import UrbangabruLogo from "/urbangabru-logo.png"; // Adjust path as necessary
import { validateEmail } from "../utils/emailValidator"; // ✅ Import email validator
import { validatePhoneNumber } from "../utils/phoneValidator"; // ✅ Import phone validator
const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [suggestedName, setSuggestedName] = useState("");
  const [duplicateCheck, setDuplicateCheck] = useState({
    checking: false,
    isDuplicate: false,
    appliedDate: null,
    duplicateType: null,
    message: null
  });
  const [emailValidation, setEmailValidation] = useState({
    isValid: false, // ✅ Start as invalid since email is required
    error: null,
    suggestion: null
  });
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false, // ✅ Start as invalid since phone is required
    error: null
  });

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${backendUrl}/api/jobs/${job_id}`);
        const jobData = res.data.job;
        if (jobData.status === "closed") {
          setIsClosed(true);
        } else {
          setJob(jobData);
          setCustomQuestions(jobData.custom_questions || []);
          // Initialize formValues for custom questions
          const initialCustomAnswers = {};
          jobData.custom_questions.forEach((q) => {
            initialCustomAnswers[q.name] = "";
          });
          setFormValues((prev) => ({ ...prev, ...initialCustomAnswers }));
        }
      } catch (err) {
        setError("Failed to load job information. Please check the URL.");
        console.error("Fetch job error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();

    const slug = (s = "") =>
      s
        .toString()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();

    const buildSuggestedName = (rawName, rawPosition, ext = ".pdf") => {
      const base =
        `${slug(rawName)}-${slug(job?.position || rawPosition || "")}`.replace(
          /^-+|-+$/g,
          ""
        ) || "resume";
      const ts = new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, "")
        .slice(0, 14); // YYYYMMDDHHmmss
      return `${base}-${ts}${ext}`;
    };

    // Security hiding-
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) || // DevTools
        (e.ctrlKey && e.key === "U") // View Source
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [job_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    
    // ✅ Validate email and check for duplicates when email changes
    if (name === 'email') {
      // Reset previous states
      setDuplicateCheck({ checking: false, isDuplicate: false, appliedDate: null });
      
      if (value && value.trim().length > 0) {
        // ✅ Always validate email format and domain for any non-empty input
        const emailValidationResult = validateEmail(value);
        setEmailValidation(emailValidationResult);
        
        // Only check for duplicates if email is valid and contains @
        if (emailValidationResult.isValid && value.includes('@')) {
          checkDuplicateApplication(value);
        }
      } else {
        // ✅ Empty email should be treated as invalid
        setEmailValidation({ 
          isValid: false, 
          error: 'Email is required', 
          suggestion: null 
        });
      }
    }
    
    // ✅ Validate phone number when it changes
    if (name === 'phone') {
      if (value && value.trim().length > 0) {
        const phoneValidationResult = validatePhoneNumber(value);
        setPhoneValidation(phoneValidationResult);
        
        // Re-check duplicates if email is valid and phone is valid
        if (formValues.email && emailValidation.isValid && phoneValidationResult.isValid) {
          setTimeout(() => {
            checkDuplicateApplication(formValues.email);
          }, 500);
        }
      } else {
        setPhoneValidation({ 
          isValid: false, 
          error: 'Phone number is required'
        });
      }
    }
    
    // ✅ Re-check duplicates when phone number changes (if email is valid)
    if (name === 'phone' && formValues.email && emailValidation.isValid) {
      // Small delay to avoid too many API calls while typing
      setTimeout(() => {
        checkDuplicateApplication(formValues.email);
      }, 500);
    }
  };

  // ✅ Function to check if candidate already applied
  const checkDuplicateApplication = async (email) => {
    if (!email || !email.includes('@') || !job_id) return;
    
    setDuplicateCheck(prev => ({ ...prev, checking: true }));
    
    try {
      const response = await axios.post(`${backendUrl}/api/form/check-duplicate`, {
        email: email.toLowerCase().trim(),
        phone: formValues.phone, // ✅ Include phone number in duplicate check
        job_id: job_id
      });
      
      if (response.data.isDuplicate) {
        setDuplicateCheck({
          checking: false,
          isDuplicate: true,
          appliedDate: response.data.appliedDate,
          duplicateType: response.data.duplicateType,
          message: response.data.message
        });
      } else {
        setDuplicateCheck({
          checking: false,
          isDuplicate: false,
          appliedDate: null,
          duplicateType: null,
          message: null
        });
      }
    } catch (err) {
      console.error('Duplicate check failed:', err);
      
      // ✅ Handle email validation errors from backend
      if (err.response?.data?.isEmailInvalid) {
        setEmailValidation({
          isValid: false,
          error: err.response.data.error,
          suggestion: err.response.data.suggestion
        });
      }
      
      setDuplicateCheck(prev => ({ ...prev, checking: false }));
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    setResume(null);
    setResumeError("");
    setSuggestedName("");

    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(file.type)) {
      setResumeError("Please upload a PDF/DOC/DOCX.");
      e.target.value = "";
      return;
    }

    const MAX = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX) {
      setResumeError("File too large. Max allowed size is 2 MB.");
      e.target.value = "";
      return;
    }

    // OK
    setResume(file);
    const ext = file.name?.match(/\.(pdf|docx?|PDF|DOCX?)$/)?.[0] || ".pdf";
    const previewName = buildSuggestedName(
      formValues.name,
      job?.position,
      ext.toLowerCase()
    );
    setSuggestedName(previewName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    // client-side guards
    if (!formValues.email || !formValues.email.trim()) {
      setSubmitting(false);
      setError("Email is required.");
      return;
    }
    
    if (!emailValidation.isValid) {
      setSubmitting(false);
      setError(emailValidation.error || "Please enter a valid email address.");
      return;
    }
    
    if (!formValues.phone || !formValues.phone.trim()) {
      setSubmitting(false);
      setError("Phone number is required.");
      return;
    }
    
    if (!phoneValidation.isValid) {
      setSubmitting(false);
      setError(phoneValidation.error || "Please enter a valid phone number.");
      return;
    }
    
    if (duplicateCheck.isDuplicate) {
      setSubmitting(false);
      setError("You have already applied for this position. Multiple applications for the same job are not allowed.");
      return;
    }
    
    if (!resume) {
      setSubmitting(false);
      setError("Please attach your resume (PDF/DOC/DOCX, up to 2 MB).");
      return;
    }
    const MAX = 2 * 1024 * 1024;
    if (resume.size > MAX) {
      setSubmitting(false);
      setError("File too large. Max allowed size is 2 MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("email", formValues.email);
      formData.append("phone", formValues.phone);

      // Append custom questions
      customQuestions.forEach((q) => {
        formData.append(`custom_${q.label}`, formValues[q.name] || ""); // Use q.label for form data key
      });

      // Append 'willingToRelocate' with its specific custom question label
      formData.append(
        "custom_Willing to relocate to Pune",
        formValues.willingToRelocate
      );

      formData.append("resume", resume);
      formData.append("job_id", job_id);
      formData.append("team", job.team);
      formData.append("position", job.position);

      await axios.post(`${backendUrl}/api/form/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Application submitted successfully! Thank you.");
      // Reset form
      setFormValues({ name: "", email: "", phone: "", willingToRelocate: "" });
      setCustomQuestions((prev) => prev.map((q) => ({ ...q, value: "" }))); // Reset custom questions
      setResume(null);
      // Clear file input visually (requires ref or direct manipulation if not controlled)
      document.getElementById("resume-upload").value = "";
    } catch (err) {
      const status = err?.response?.status;
      if (status === 413) setError("File too large. Max allowed size is 2 MB.");
      else if (status === 400)
        setError(err?.response?.data?.error || "Please upload a PDF/DOC/DOCX.");
      else if (status === 502)
        setError("Resume upload failed. Please try again.");
      else if (status === 409) {
        // ✅ Handle duplicate application error from backend
        const errorData = err?.response?.data;
        setError(errorData?.error || "You have already applied for this position.");
        setDuplicateCheck({
          checking: false,
          isDuplicate: true,
          appliedDate: errorData?.appliedDate,
          duplicateType: errorData?.duplicateType || 'email',
          message: errorData?.error
        });
      }
      else if (err?.response?.data?.isEmailInvalid) {
        // ✅ Handle email validation errors from backend
        setError(err.response.data.error);
        if (err.response.data.suggestion) {
          setError(`${err.response.data.error}. ${err.response.data.suggestion}`);
        }
        setEmailValidation({
          isValid: false,
          error: err.response.data.error,
          suggestion: err.response.data.suggestion
        });
      }
      console.error(
        "Submission failed:",
        err.response ? err.response.data : err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Job Details
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch the information...
          </p>
        </div>
        {/* Enhanced Background decoration */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
        <div className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-red-100 max-w-lg w-full text-center transform hover:scale-105 transition-transform duration-300">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-red-700 mb-4">
            Position Closed
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            We appreciate your interest! Unfortunately, this job posting is no
            longer accepting applications.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            Please check our careers page for other opportunities.
          </div>
        </div>
        {/* Enhanced Background decoration */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-yellow-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4 py-12">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-lg w-full">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 transform hover:scale-[1.02] transition-all duration-300">
          {/* Enhanced Urbangabru Logo and Branding Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-lg">
                <img
                  src={UrbangabruLogo}
                  alt="Urbangabru Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 tracking-tight">
              Urbangabru
            </h1>
            <div className="flex items-center mt-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-full">
              <svg
                className="w-4 h-4 text-indigo-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                />
              </svg>
              <p className="text-indigo-700 font-semibold text-sm">
                Career Application
              </p>
            </div>
          </div>

          {/* Enhanced Job Title Section */}
          <div className="text-center mb-8 p-6 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Apply for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                {job.position}
              </span>
            </h2>
            <p className="text-gray-600 font-medium">
              Join our{" "}
              <span className="text-indigo-600 font-semibold">{job.team}</span>{" "}
              team and make an impact!
            </p>
          </div>

          {/* Enhanced Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-xl flex items-center mb-6 shadow-sm">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Enhanced Success Message */}
          {success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 text-green-700 px-6 py-4 rounded-xl flex items-center mb-6 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Success!</p>
                <p className="text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Enhanced Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced Name Field */}
            <div className="relative">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formValues.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 hover:bg-white text-gray-800 placeholder-gray-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Email Field */}
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formValues.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-3 transition-all duration-200 bg-gray-50/50 hover:bg-white text-gray-800 placeholder-gray-400 ${
                    (formValues.email && formValues.email.trim().length > 0 && (!emailValidation.isValid || duplicateCheck.isDuplicate))
                      ? 'border-red-300 focus:ring-red-100 focus:border-red-400' 
                      : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-400'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {duplicateCheck.checking ? (
                    <svg className="w-5 h-5 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (formValues.email && formValues.email.trim().length > 0 && !emailValidation.isValid) ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : duplicateCheck.isDuplicate ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : formValues.email && emailValidation.isValid && !duplicateCheck.isDuplicate ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* ✅ Email Validation Error */}
              {!emailValidation.isValid && formValues.email && formValues.email.trim().length > 0 && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {emailValidation.error}
                      </p>
                      {emailValidation.suggestion && (
                        <p className="text-xs text-red-600 mt-1">
                          {emailValidation.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* ✅ Duplicate Application Warning */}
              {emailValidation.isValid && duplicateCheck.isDuplicate && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {duplicateCheck.duplicateType === 'phone' 
                          ? 'A candidate with this phone number has already applied'
                          : 'You have already applied for this position'
                        }
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Application submitted on: {duplicateCheck.appliedDate ? new Date(duplicateCheck.appliedDate).toLocaleDateString() : 'Unknown date'}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {duplicateCheck.duplicateType === 'phone' 
                          ? 'Multiple applications with the same phone number are not allowed, even with different country codes.'
                          : 'Multiple applications for the same job are not allowed. You can apply for other positions.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Phone Field */}
            <div className="relative">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g., +91 9876543210"
                  value={formValues.phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-3 transition-all duration-200 bg-gray-50/50 hover:bg-white text-gray-800 placeholder-gray-400 ${
                    (formValues.phone && formValues.phone.trim().length > 0 && !phoneValidation.isValid)
                      ? 'border-red-300 focus:ring-red-100 focus:border-red-400' 
                      : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-400'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {(formValues.phone && formValues.phone.trim().length > 0 && !phoneValidation.isValid) ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : formValues.phone && phoneValidation.isValid ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* ✅ Phone Validation Error */}
              {!phoneValidation.isValid && formValues.phone && formValues.phone.trim().length > 0 && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {phoneValidation.error}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Custom Questions */}
            {customQuestions.map((q, idx) => (
              <div key={idx} className="relative">
                <label
                  htmlFor={q.name}
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {q.label}
                </label>
                <textarea
                  id={q.name}
                  name={q.name}
                  placeholder="Share your thoughts..."
                  value={formValues[q.name] || ""}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 hover:bg-white text-gray-800 placeholder-gray-400 resize-none"
                />
              </div>
            ))}

            {/* Enhanced Relocation Field */}
            <div className="relative">
              <label
                htmlFor="willingToRelocate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Willing to relocate to Pune?
              </label>
              <div className="relative">
                <select
                  id="willingToRelocate"
                  name="willingToRelocate"
                  value={formValues.willingToRelocate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 hover:bg-white text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="">Select your preference</option>
                  <option value="Yes">Yes, I'm willing to relocate</option>
                  <option value="No">No, I can't</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Resume Upload */}
            <div className="relative">
              <label
                htmlFor="resume-upload"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Resume Upload
              </label>
              <div className="relative">
                <input
                  id="resume-upload"
                  type="file"
                  onChange={handleResumeUpload}
                  accept=".pdf,.doc,.docx"
                  required
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-200 bg-gray-50/50 hover:bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-50 file:to-cyan-50 file:text-indigo-700 hover:file:from-indigo-100 hover:file:to-cyan-100 file:cursor-pointer file:transition-all file:duration-200"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Accepted: PDF/DOC/DOCX • Max size: 2 MB
                </p>

                {resumeError && (
                  <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {resumeError}
                  </div>
                )}

                {!resumeError && suggestedName && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm">
                    This file will be saved as:{" "}
                    <span className="font-medium">{suggestedName}</span>
                  </div>
                )}
              </div>
              {resume && (
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-green-700 font-medium">
                      {resume.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={submitting || duplicateCheck.isDuplicate || (formValues.email && !emailValidation.isValid)}
              className={`w-full py-4 rounded-xl font-semibold text-lg focus:outline-none focus:ring-3 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${
                duplicateCheck.isDuplicate || (formValues.email && !emailValidation.isValid)
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-700 hover:to-cyan-700 focus:ring-indigo-200'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Submitting Application...
                </span>
              ) : (formValues.email && !emailValidation.isValid) ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Invalid Email
                </span>
              ) : duplicateCheck.isDuplicate ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Already Applied
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Submit Application
                </span>
              )}
            </button>
          </form>

          {/* Enhanced Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Your information is secure and will only be used for recruitment
              purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Custom styles for animations */}
      <style> ``</style>
    </div>
  );
};

export default HiringForm;
