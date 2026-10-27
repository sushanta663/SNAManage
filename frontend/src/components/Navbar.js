import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <Link to="/" className="brand">SNA<span>Manage</span></Link>
      <div className="nav-links">
        {user && <Link to="/">Dashboard</Link>}
        {user && <Link to="/requests">Requests</Link>}
        {user && <Link to="/projects">Projects</Link>}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && <span>{user.name} ({user.role.toUpperCase()})</span>}
        {user && <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>Logout</button>}
      </div>
    </div>
  );
}
