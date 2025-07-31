import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://recruit-automation-backend-v2.onrender.com/api/auth/login', { email, password });
      const token = res.data.token;
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ token, role: payload.role });
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;