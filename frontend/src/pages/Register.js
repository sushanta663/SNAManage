import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', level: 'UG', rollNo: '', staffCode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      setSuccess('Registered! Taking you to login...');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Is the backend running?');
    }
  }

  return (
    <div className="form-box card">
      <h2>Register</h2>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <label>I am a</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="hod">HOD</option>
        </select>

        {form.role === 'student' && (
          <>
            <label>Programme</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="UG">UG</option>
              <option value="PG">PG</option>
            </select>
            <label>Roll Number</label>
            <input value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} required />
          </>
        )}
        {form.role !== 'student' && (
          <>
            <label>Department Staff Code</label>
            <input value={form.staffCode} onChange={(e) => setForm({ ...form, staffCode: e.target.value })} required />
          </>
        )}
        <button className="btn btn-green" type="submit">Register</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}
