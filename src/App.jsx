import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HiringForm from './pages/HiringForm';
import CandidateViewer from './pages/CandidateViewer';
import HoldPool from './pages/HoldPool';

const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/" replace />;
};

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // If needed, validate token here with backend
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public: Job Application Form */}
        <Route path="/form/:job_id" element={<HiringForm />} />

        {/* Public: Login page at "/" */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setUser={(user) => {
                setUser(user);
                localStorage.setItem("user", JSON.stringify(user));
              }} />
            )
          }
        />

        {/* Protected: Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} setUser={setUser}/>
            </ProtectedRoute>
          }
        />

        {/* Protected: Candidate Viewer */}
        <Route
          path="/candidates/:job_id"
          element={
            <ProtectedRoute user={user}>
              <CandidateViewer />
            </ProtectedRoute>
          }
        />

        {/* Protected: Hold Pool */}
        <Route
          path="/hold-pool"
          element={
            <ProtectedRoute user={user}>
              <HoldPool />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;


// // App.jsx
// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import HiringForm from './pages/HiringForm';
// import CandidateViewer from './pages/CandidateViewer';

// const App = () => {
//   const [user, setUser] = useState(null);

//   return (
//     <Router>
//       <Routes>
//         <Route path="/form/:job_id" element={<HiringForm />} />
//         <Route path="/" element={user ? <Dashboard user={user} /> : <Login setUser={setUser} />} />
//         <Route path="/candidates/:job_id" element={<CandidateViewer />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;
