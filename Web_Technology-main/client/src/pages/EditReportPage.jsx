import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient, { getAuthHeaders, getStoredUser } from '../utils/api';
import '../styles/editStyles.css';

const DAMAGE_TYPES = ['Surface Wear', 'Road Break', 'Edge Damage', 'Unclassified'];

const EditReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [damageType, setDamageType] = useState(DAMAGE_TYPES[0]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const currentUser = getStoredUser();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const endpoint = currentUser?.role === 'admin' ? '/api/reports/admin' : '/api/reports';
        const response = await apiClient.get(endpoint, {
          headers: getAuthHeaders()
        });
        const currentReport = response.data.find((item) => item._id === id);

        if (!currentReport) {
          setErrorMessage('Report not found');
          return;
        }

        setReport(currentReport);
        setDamageType(DAMAGE_TYPES.includes(currentReport.damageType) ? currentReport.damageType : DAMAGE_TYPES[0]);
        setLocation(currentReport.location);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Could not load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      await apiClient.put(
        `/api/reports/${id}`,
        { damageType, location },
        { headers: getAuthHeaders() }
      );
      navigate(currentUser?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="editPageShell"><p className="statusMessageText">Loading report...</p></main>;
  }

  return (
    <main className="editPageShell">
      <section className="editReportBox">
        <h1 className="pageHeadingText">Edit report</h1>
        {report ? <img src={report.imageUrl} alt="Selected report" className="editPreviewImage" /> : null}
        <form className="editFormLayout" onSubmit={handleSubmit}>
          <label className="fieldLabelText" htmlFor="damageType">Damage type</label>
          <select className="formInputField" id="damageType" value={damageType} onChange={(event) => setDamageType(event.target.value)}>
            {DAMAGE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <label className="fieldLabelText" htmlFor="location">Location</label>
          <input className="formInputField" id="location" value={location} onChange={(event) => setLocation(event.target.value)} />
          <button className="primaryFormButton" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Update report'}
          </button>
        </form>
        {errorMessage ? <p className="errorMessageText">{errorMessage}</p> : null}
      </section>
    </main>
  );
};

export default EditReportPage;
