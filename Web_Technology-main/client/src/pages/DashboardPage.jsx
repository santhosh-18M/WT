import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getAuthHeaders } from '../utils/api';
import ReportCard from '../components/ReportCard.jsx';
import RoadDamageMap from '../components/RoadDamageMap.jsx';
import '../styles/dashboardStyles.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await apiClient.get('/api/reports', {
          headers: getAuthHeaders()
        });
        setReports(response.data);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Could not load reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleDelete = async (reportId) => {
    const confirmDelete = window.confirm('Delete this report?');
    if (!confirmDelete) {
      return;
    }

    try {
      await apiClient.delete(`/api/reports/${reportId}`, {
        headers: getAuthHeaders()
      });
      setReports((previousReports) => previousReports.filter((report) => report._id !== reportId));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleEdit = (reportId) => {
    navigate(`/edit/${reportId}`);
  };

  return (
    <main className="dashboardPageShell">
      <section className="dashboardTopBlock">
        <h1 className="pageHeadingText">Your reports</h1>
      </section>

      <RoadDamageMap reports={reports} />

      {loading ? <p className="statusMessageText">Loading reports...</p> : null}
      {errorMessage ? <p className="errorMessageText">{errorMessage}</p> : null}

      <section className="reportGridLayout">
        {reports.map((report) => (
          <ReportCard
            key={report._id}
            report={report}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </section>

      {!loading && reports.length === 0 ? (
        <p className="statusMessageText">No reports found yet.</p>
      ) : null}
    </main>
  );
};

export default DashboardPage;
