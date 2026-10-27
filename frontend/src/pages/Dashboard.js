import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [waitingProjects, setWaitingProjects] = useState(0);
  const [myApplication, setMyApplication] = useState(null);

  useEffect(() => {
    api.get('/requests/stats').then((res) => setStats(res.data)).catch(() => {});
    if (user.role === 'student') {
      api.get('/projects/allocations/mine').then((res) => setMyApplication(Array.isArray(res.data) && res.data.length ? res.data[0] : null)).catch(() => {});
    } else {
      api.get('/projects/allocations/pending').then((res) => setWaitingProjects(Array.isArray(res.data) ? res.data.length : 0)).catch(() => {});
    }
  }, [user.role]);

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p className="muted">
        {user.role === 'student' && 'Raise department requests and apply for projects. Track every approval step here.'}
        {user.role === 'faculty' && 'Review student requests, post projects and approve project applications.'}
        {user.role === 'hod' && 'Give final approval to requests and project allocations.'}
      </p>

      {!stats && <p>Loading...</p>}
      {stats && (
        <div className="grid">
          {user.role !== 'student' && (
            <div className="card stat">
              <div className="num red">{stats.waiting}</div>
              <div>Requests waiting for you</div>
              <Link to="/requests">Open</Link>
            </div>
          )}
          {user.role !== 'student' && (
            <div className="card stat">
              <div className="num red">{waitingProjects}</div>
              <div>Project applications waiting</div>
              <Link to="/projects">Open</Link>
            </div>
          )}
          <div className="card stat"><div className="num">{stats.total}</div><div>Total requests</div></div>
          <div className="card stat"><div className="num">{stats.pending}</div><div>In progress</div></div>
          <div className="card stat"><div className="num">{stats.approved}</div><div>Approved</div></div>
          <div className="card stat"><div className="num red">{stats.rejected}</div><div>Rejected</div></div>
        </div>
      )}

      {user.role === 'student' && (
        <div className="card">
          <h3>My Project Application</h3>
          {!myApplication && <p>You have not applied for any project yet. <Link to="/projects">Browse projects</Link></p>}
          {myApplication && (
            <p>
              {myApplication.projectTitle} &middot;{' '}
              <span className={'badge ' + (myApplication.status === 'allocated' ? 'badge-green' : myApplication.status === 'rejected' ? 'badge-red' : '')}>
                {myApplication.status}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
