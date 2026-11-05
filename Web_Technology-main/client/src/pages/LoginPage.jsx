import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { saveAuthData } from '../utils/api';
import '../styles/loginStyles.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await apiClient.post('/api/auth/login', formData);
      saveAuthData(response.data.token, response.data.user);
      const nextRoute = response.data.user?.role === 'admin'
        ? '/admin'
        : response.data.user?.role === 'gov'
          ? '/gov'
          : '/dashboard';

      navigate(nextRoute);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPageShell">
      <section className="loginContainer">
        <h1 className="authTitleText">Welcome back</h1>
        <form className="authFormLayout" onSubmit={handleSubmit}>
          <label className="fieldLabelText" htmlFor="email">Email</label>
          <input className="formInputField" id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
          <label className="fieldLabelText" htmlFor="password">Password</label>
          <input className="formInputField" id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" />
          <button className="primaryFormButton" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {errorMessage ? <p className="errorMessageText">{errorMessage}</p> : null}
        <p className="authFooterText">
          New user? <Link to="/signup">Create an account</Link>
        </p>
        <p className="authFooterText">
          Government portal? <Link to="/gov-login">Use gov login</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
