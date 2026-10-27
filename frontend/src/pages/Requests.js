import React, { useContext, useEffect, useState } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import Steps from '../components/Steps';

export default function Requests() {
  const { user } = useContext(AuthContext);
  const [types, setTypes] = useState([]);
  const [mine, setMine] = useState([]);       // student: own requests, HOD: all requests
  const [pending, setPending] = useState([]); // faculty/HOD: waiting for me
  const [form, setForm] = useState({ type: '', title: '', description: '' });
  const [remarks, setRemarks] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function load() {
    if (user.role === 'student') {
      api.get('/requests/types').then((res) => setTypes(Array.isArray(res.data) ? res.data : []));
      api.get('/requests/mine').then((res) => setMine(Array.isArray(res.data) ? res.data : []));
    } else {
      api.get('/requests/pending').then((res) => setPending(Array.isArray(res.data) ? res.data : []));
      if (user.role === 'hod') api.get('/requests/all').then((res) => setMine(Array.isArray(res.data) ? res.data : []));
    }
  }
  // eslint-disable-next-line
  useEffect(load, []);

  async function submitRequest(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/requests', form);
      setSuccess('Request submitted. It is now with the first approver.');
      setForm({ type: '', title: '', description: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit request');
    }
  }

  async function decide(id, action) {
    setError('');
    try {
      await api.post('/requests/' + id + '/decision', { action, remark: remarks[id] || '' });
      setRemarks({ ...remarks, [id]: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    }
  }

  const chosen = types.find((t) => t.type === form.type);

  return (
    <div>
      <h1>Requests</h1>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      {user.role === 'student' && (
        <div className="card">
          <h2>New Request</h2>
          <form onSubmit={submitRequest}>
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
              <option value="">-- select --</option>
              {types.map((t) => <option key={t.type} value={t.type}>{t.type}</option>)}
            </select>
            {chosen && <p className="muted">Approval path: {chosen.steps.map((s) => s.toUpperCase()).join(' \u2192 ')}</p>}
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <label>Details</label>
            <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="btn btn-green" type="submit">Submit Request</button>
          </form>
        </div>
      )}

      {user.role !== 'student' && (
        <div>
          <h2>Waiting for your approval</h2>
          {pending.length === 0 && <p className="muted">Nothing is waiting for you.</p>}
          {pending.map((r) => (
            <div className="card" key={r._id}>
              <h3>{r.title}</h3>
              <p>{r.type} &middot; {r.studentName} ({r.rollNo}, {r.level})</p>
              <p>{r.description}</p>
              <Steps steps={r.steps} currentStep={r.currentStep} status={r.status} />
              <input placeholder="Remark (required to reject)" value={remarks[r._id] || ''} onChange={(e) => setRemarks({ ...remarks, [r._id]: e.target.value })} />
              <button className="btn btn-green" onClick={() => decide(r._id, 'approve')}>Approve</button>
              <button className="btn btn-red" onClick={() => decide(r._id, 'reject')}>Reject</button>
            </div>
          ))}
        </div>
      )}

      <h2>{user.role === 'student' ? 'My Requests' : user.role === 'hod' ? 'All Department Requests' : ''}</h2>
      {user.role === 'student' && mine.length === 0 && <p className="muted">You have not raised any request yet.</p>}
      {mine.map((r) => (
        <div className="card" key={r._id}>
          <h3>
            {r.title}{' '}
            <span className={'badge ' + (r.status === 'approved' ? 'badge-green' : r.status === 'rejected' ? 'badge-red' : '')}>{r.status}</span>
          </h3>
          <p className="muted">{r.type}{user.role === 'hod' && ' \u00b7 ' + r.studentName + ' (' + r.rollNo + ')'}</p>
          <Steps steps={r.steps} currentStep={r.currentStep} status={r.status} />
          {r.history.filter((h) => h.remark).map((h, i) => (
            <p className="muted" key={i}>{h.role.toUpperCase()} {h.by} {h.action}: {h.remark}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
