import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { saveAuthData } from '../utils/api';
import '../styles/loginStyles.css';

const GovLoginPage = () => {
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

      if (response.data.user?.role !== 'gov') {
        setErrorMessage('This login is for government accounts only');
        return;
      }

      navigate('/gov');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Government login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPageShell">
      <section className="loginContainer govLoginContainer">
        <p className="heroLabelText">Government portal</p>
        <h1 className="authTitleText">Gov road reporting access</h1>
        <p className="govLoginCopyText">Sign in to monitor affected routes, review public reports, and inspect damage trends across your jurisdiction.</p>
        <form className="authFormLayout" onSubmit={handleSubmit}>
          <label className="fieldLabelText" htmlFor="gov-email">Email</label>
          <input className="formInputField" id="gov-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your government email" />
          <label className="fieldLabelText" htmlFor="gov-password">Password</label>
          <input className="formInputField" id="gov-password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" />
          <button className="primaryFormButton" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Gov login'}
          </button>
        </form>
        {errorMessage ? <p className="errorMessageText">{errorMessage}</p> : null}
        <p className="authFooterText">
          Need the regular portal? <Link to="/login">Use standard login</Link>
        </p>
      </section>
    </main>
  );
};

export default GovLoginPage;