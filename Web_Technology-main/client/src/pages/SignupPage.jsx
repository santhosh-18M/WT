import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { saveAuthData } from '../utils/api';
import '../styles/loginStyles.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', accountType: 'people', secretCode: '' });
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isGovAccount = formData.accountType === 'gov';

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setMessage('');

    try {
      const response = await apiClient.post('/api/auth/signup', formData);
      saveAuthData(response.data.token, response.data.user);
      setMessage('Signup successful. Redirecting...');
      navigate(response.data.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPageShell">
      <section className="signupFormBox">
        <h1 className="authTitleText">Create account</h1>
        <form className="authFormLayout" onSubmit={handleSubmit}>
          <label className="fieldLabelText" htmlFor="name">Name</label>
          <input className="formInputField" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" />
          <label className="fieldLabelText" htmlFor="email">Email</label>
          <input className="formInputField" id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
          <label className="fieldLabelText" htmlFor="accountType">Account type</label>
          <select className="formInputField" id="accountType" name="accountType" value={formData.accountType} onChange={handleChange}>
            <option value="people">People</option>
            <option value="gov">Gov</option>
          </select>
          {isGovAccount ? (
            <>
              <label className="fieldLabelText" htmlFor="secretCode">Gov secret code</label>
              <input className="formInputField" id="secretCode" name="secretCode" value={formData.secretCode} onChange={handleChange} placeholder="Enter secret code" />
            </>
          ) : null}
          <label className="fieldLabelText" htmlFor="password">Password</label>
          <input className="formInputField" id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create a password" />
          <button className="primaryFormButton" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Signup'}
          </button>
        </form>
        {message ? <p className="successMessageText">{message}</p> : null}
        {errorMessage ? <p className="errorMessageText">{errorMessage}</p> : null}
        <p className="authFooterText">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </section>
    </main>
  );
};

export default SignupPage;
