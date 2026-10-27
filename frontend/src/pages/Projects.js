import React, { useContext, useEffect, useState } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';

export default function Projects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [myApps, setMyApps] = useState([]);       // student
  const [waiting, setWaiting] = useState([]);     // faculty / HOD
  const [finalList, setFinalList] = useState([]); // faculty / HOD
  const [form, setForm] = useState({ title: '', description: '', level: 'UG', slots: 1 });
  const [remarks, setRemarks] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function load() {
    api.get('/projects').then((res) => setProjects(Array.isArray(res.data) ? res.data : []));
    if (user.role === 'student') {
      api.get('/projects/allocations/mine').then((res) => setMyApps(Array.isArray(res.data) ? res.data : []));
    } else {
      api.get('/projects/allocations/pending').then((res) => setWaiting(Array.isArray(res.data) ? res.data : []));
      api.get('/projects/allocations/final').then((res) => setFinalList(Array.isArray(res.data) ? res.data : []));
    }
  }
  // eslint-disable-next-line
  useEffect(load, []);

  async function createProject(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/projects', form);
      setSuccess('Project posted');
      setForm({ title: '', description: '', level: 'UG', slots: 1 });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create project');
    }
  }

  async function apply(id) {
    setError(''); setSuccess('');
    try {
      await api.post('/projects/' + id + '/apply');
      setSuccess('Applied! Your application goes to the faculty first, then the HOD.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not apply');
    }
  }

  async function decide(id, action) {
    setError('');
    try {
      await api.post('/projects/allocations/' + id + '/decision', { action, remark: remarks[id] || '' });
      setRemarks({ ...remarks, [id]: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    }
  }

  return (
    <div>
      <h1>Projects</h1>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      {user.role === 'faculty' && (
        <div className="card">
          <h2>Post a Project</h2>
          <form onSubmit={createProject}>
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <label>Description</label>
            <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label>For</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="UG">UG</option>
              <option value="PG">PG</option>
            </select>
            <label>Number of slots</label>
            <input type="number" min="1" value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} required />
            <button className="btn btn-green" type="submit">Post Project</button>
          </form>
        </div>
      )}

      {user.role !== 'student' && (
        <div>
          <h2>{user.role === 'faculty' ? 'Applications to your projects' : 'Waiting for final approval'}</h2>
          {waiting.length === 0 && <p className="muted">Nothing is waiting for you.</p>}
          {waiting.map((a) => (
            <div className="card" key={a._id}>
              <h3>{a.studentName} ({a.rollNo})</h3>
              <p>Project: {a.projectTitle} &middot; Faculty: {a.facultyName}</p>
              <input placeholder="Remark (required to reject)" value={remarks[a._id] || ''} onChange={(e) => setRemarks({ ...remarks, [a._id]: e.target.value })} />
              <button className="btn btn-green" onClick={() => decide(a._id, 'approve')}>Approve</button>
              <button className="btn btn-red" onClick={() => decide(a._id, 'reject')}>Reject</button>
            </div>
          ))}
        </div>
      )}

      {user.role === 'student' && (
        <div>
          <h2>My Applications</h2>
          {myApps.length === 0 && <p className="muted">You have not applied yet.</p>}
          {myApps.map((a) => (
            <div className="card" key={a._id}>
              {a.projectTitle}{' '}
              <span className={'badge ' + (a.status === 'allocated' ? 'badge-green' : a.status === 'rejected' ? 'badge-red' : '')}>{a.status}</span>
              {a.remark && <p className="muted">Reason: {a.remark}</p>}
            </div>
          ))}
        </div>
      )}

      <h2>All Projects</h2>
      {projects.length === 0 && <p className="muted">No projects posted yet.</p>}
      <div className="grid">
        {projects.map((p) => (
          <div className="card" key={p._id}>
            <h3>{p.title}</h3>
            <p><span className="badge badge-green">{p.level}</span> &nbsp; {p.facultyName}</p>
            <p>{p.description}</p>
            <p className="muted">Slots filled: {p.filled} / {p.slots}</p>
            {user.role === 'student' && (
              <button className="btn btn-green" disabled={p.level !== user.level || p.filled >= p.slots} onClick={() => apply(p._id)}>
                {p.level !== user.level ? 'Not for ' + user.level : p.filled >= p.slots ? 'Full' : 'Apply'}
              </button>
            )}
          </div>
        ))}
      </div>

      {user.role !== 'student' && (
        <div>
          <h2>Final Allocations</h2>
          {finalList.length === 0 && <p className="muted">No student has been allocated yet.</p>}
          {finalList.length > 0 && (
            <table>
              <thead><tr><th>Roll No</th><th>Student</th><th>Project</th><th>Faculty</th></tr></thead>
              <tbody>
                {finalList.map((a) => (
                  <tr key={a._id}><td>{a.rollNo}</td><td>{a.studentName}</td><td>{a.projectTitle}</td><td>{a.facultyName}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
