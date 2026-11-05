import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuthData, getStoredUser, getToken } from '../utils/api';
import '../styles/navbarStyles.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = getToken();
  const user = getStoredUser();
  const isAdmin = user?.role === 'admin';
  const isGov = user?.role === 'gov';

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  return (
    <header className="navbarShell">
      <Link to="/" className="brandTitleLink">
        Road Damage Detection System
      </Link>
      <nav aria-label="Primary navigation">
        <ul className="navbarLinkRow">
          <li>
            <Link to="/" className="navbarLinkItem">Home</Link>
          </li>
          {token ? (
            <>
              {!isGov ? (
                <li>
                  <Link to="/upload" className="navbarLinkItem">Upload</Link>
                </li>
              ) : null}
              {!isGov ? (
                <li>
                  <Link to="/dashboard" className="navbarLinkItem">Dashboard</Link>
                </li>
              ) : null}
              {isAdmin ? (
                <li>
                  <Link to="/admin" className="navbarLinkItem">Admin</Link>
                </li>
              ) : null}
              {isGov ? (
                <li>
                  <Link to="/gov" className="navbarLinkItem">Gov Dashboard</Link>
                </li>
              ) : null}
              <li className="navbarUserNameWrap">
                <span className="navbarUserName">Hello, {user?.name || 'User'}{isAdmin ? ' (Admin)' : ''}{isGov ? ' (Gov)' : ''}</span>
              </li>
              <li>
                <button type="button" className="logoutButtonStyle" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="navbarLinkItem">Login</Link>
              </li>
              <li>
                <Link to="/gov-login" className="navbarLinkItem">Gov Login</Link>
              </li>
              <li>
                <Link to="/signup" className="navbarLinkItem">Signup</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
