// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HiringForm from './pages/HiringForm';
import CandidateViewer from './pages/CandidateViewer';

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/form/:job_id" element={<HiringForm />} />
        <Route path="/" element={user ? <Dashboard user={user} /> : <Login setUser={setUser} />} />
        <Route path="/candidates/:job_id" element={<CandidateViewer />} />
      </Routes>
    </Router>
  );
};

export default App;


// import React, { useState, useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import HiringForm from "./pages/HiringForm";
// import CandidateViewer from "./pages/CandidateViewer";

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [isUserLoaded, setIsUserLoaded] = useState(false);

//   useEffect(() => {
//     const saved = localStorage.getItem("user");
//     if (saved) {
//       setUser(JSON.parse(saved));
//     }
//     setIsUserLoaded(true);
//   }, []);

//   const ProtectedRoute = ({ children }) => {
//     if (!user) return <Navigate to="/login" replace />;
//     return children;
//   };

//   if (!isUserLoaded) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-700 font-semibold text-xl">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <Routes>
//         <Route path="/form/:job_id" element={<HiringForm />} />
//         <Route
//           path="/login"
//           element={
//             user ? <Navigate to="/" replace /> : <Login setUser={setUser} />
//           }
//         />
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <Dashboard user={user} setUser={setUser} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/candidates/:job_id"
//           element={
//             <ProtectedRoute>
//               <CandidateViewer user={user} />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;




// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import HiringForm from './pages/HiringForm';
// import CandidateViewer from './pages/CandidateViewer';

// const App = () => {
//   const [user, setUser] = useState(() => {
//     const saved = localStorage.getItem("user");
//     return saved ? JSON.parse(saved) : null;
//   });

//   const ProtectedRoute = ({ children }) => {
//     if (!user) return <Navigate to="/login" replace />;
//     return children;
//   };

//   return (
//     <Router>
//       <Routes>
//         <Route path="/form/:job_id" element={<HiringForm />} />
//         <Route
//           path="/login"
//           element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />}
//         />
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <Dashboard user={user} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/candidates/:job_id"
//           element={
//             <ProtectedRoute>
//               <CandidateViewer user={user} />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;
