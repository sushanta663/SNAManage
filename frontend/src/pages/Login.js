import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Is the backend running?');
    }
  }

  return (
    <div className="form-box card">
      <h2>Login</h2>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-green" type="submit">Login</button>
      </form>
      <p className="muted">New here? <Link to="/register">Register</Link></p>
    </div>
  );
}
