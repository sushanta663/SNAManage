import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Projects from './pages/Projects';

function Private({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Private><Dashboard /></Private>} />
          <Route path="/requests" element={<Private><Requests /></Private>} />
          <Route path="/projects" element={<Private><Projects /></Private>} />
        </Routes>
        <footer>SNAManage &mdash; IT Lab Project</footer>
      </div>
    </AuthProvider>
  );
}
