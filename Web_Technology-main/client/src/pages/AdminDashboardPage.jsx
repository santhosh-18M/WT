import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getAuthHeaders } from '../utils/api';
import RoadDamageMap from '../components/RoadDamageMap.jsx';
import '../styles/adminStyles.css';

const MAX_CHART_WIDTH = 320;
const DAMAGE_TYPE_OPTIONS = ['Surface Wear', 'Road Break', 'Edge Damage', 'Unclassified'];

const BarChart = ({ title, rows, valueKey, labelKey, colorClassName, emptyText }) => {
  const maxValue = useMemo(() => {
    if (!rows.length) {
      return 1;
    }

    return Math.max(...rows.map((row) => row[valueKey]));
  }, [rows, valueKey]);

  return (
    <section className="adminChartCard">
      <h3 className="adminChartTitle">{title}</h3>
      {rows.length === 0 ? (
        <p className="statusMessageText">{emptyText}</p>
      ) : (
        <ul className="adminChartList">
          {rows.map((row) => {
            const scaledWidth = Math.max(10, Math.round((row[valueKey] / maxValue) * MAX_CHART_WIDTH));

            return (
              <li key={`${row[labelKey]}-${row[valueKey]}`} className="adminChartItem">
                <span className="adminChartLabel">{row[labelKey]}</span>
                <div className="adminChartBarWrap">
                  <span
                    className={`adminChartBar ${colorClassName}`}
                    style={{ width: `${scaledWidth}px` }}
                  />
                  <span className="adminChartValue">{row[valueKey]}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [damageFilter, setDamageFilter] = useState('');

  const loadAdminData = async (nextFilters = {}) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const params = {};
      const resolvedArea = nextFilters.area ?? areaFilter;
      const resolvedDamageType = nextFilters.damageType ?? damageFilter;

      if (resolvedArea.trim()) {
        params.area = resolvedArea.trim();
      }
      if (resolvedDamageType.trim()) {
        params.damageType = resolvedDamageType.trim();
      }

      const [reportsResponse, analyticsResponse] = await Promise.all([
        apiClient.get('/api/reports/admin', {
          params,
          headers: getAuthHeaders()
        }),
        apiClient.get('/api/reports/admin/analytics', {
          params,
          headers: getAuthHeaders()
        })
      ]);

      setReports(reportsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const onApplyFilters = (event) => {
    event.preventDefault();
    loadAdminData();
  };

  const handleDamageFilterChange = (event) => {
    const nextDamageType = event.target.value;
    setDamageFilter(nextDamageType);
    loadAdminData({ area: areaFilter, damageType: nextDamageType });
  };

  const onResetFilters = () => {
    setAreaFilter('');
    setDamageFilter('');
    loadAdminData({ area: '', damageType: '' });
  };

  const handleEdit = (reportId) => {
    navigate(`/edit/${reportId}`);
  };

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

  return (
    <main className="adminPageShell">
      <section className="adminHeaderBlock">
        <h1 className="pageHeadingText">Admin Dashboard</h1>
        <p className="statusMessageText">View all reports, filter by area and damage type, and monitor damage analytics.</p>
      </section>

      <form className="adminFilterForm" onSubmit={onApplyFilters}>
        <label className="fieldLabelText" htmlFor="adminAreaFilter">Area</label>
        <input
          className="formInputField"
          id="adminAreaFilter"
          value={areaFilter}
          onChange={(event) => setAreaFilter(event.target.value)}
          placeholder="Filter by location or area"
        />

        <label className="fieldLabelText" htmlFor="adminDamageFilter">Damage Type</label>
        <select
          className="formInputField"
          id="adminDamageFilter"
          value={damageFilter}
          onChange={handleDamageFilterChange}
        >
          <option value="">All damage types</option>
          {DAMAGE_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <div className="adminFilterActions">
          <button type="submit" className="primaryFormButton" disabled={loading}>
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
          <button type="button" className="secondaryActionButton" onClick={onResetFilters} disabled={loading}>
            Reset
          </button>
        </div>
      </form>

      {errorMessage ? <p className="errorMessageText">{errorMessage}</p> : null}
      {damageFilter ? <p className="statusMessageText">Active damage filter: {damageFilter}</p> : null}

      {analytics ? (
        <section className="adminKpiGrid">
          <article className="adminKpiCard">
            <h2 className="adminKpiLabel">Total Reports</h2>
            <p className="adminKpiValue">{analytics.totalReports}</p>
          </article>
          <article className="adminKpiCard">
            <h2 className="adminKpiLabel">Average Confidence</h2>
            <p className="adminKpiValue">{analytics.averageConfidence}%</p>
          </article>
          <article className="adminKpiCard">
            <h2 className="adminKpiLabel">High Damage Zone</h2>
            <p className="adminKpiValue adminKpiValueSmall">{analytics.highDamageZones?.[0]?.area || 'N/A'}</p>
          </article>
        </section>
      ) : null}

      <RoadDamageMap reports={reports} />

      {analytics ? (
        <section className="adminChartsGrid">
          <BarChart
            title="Damage Type Distribution"
            rows={analytics.damageTypeBreakdown || []}
            valueKey="count"
            labelKey="damageType"
            colorClassName="adminChartBarPrimary"
            emptyText="No damage type analytics available"
          />

          <BarChart
            title="Area Report Volume"
            rows={analytics.areaBreakdown || []}
            valueKey="count"
            labelKey="area"
            colorClassName="adminChartBarSecondary"
            emptyText="No area analytics available"
          />
        </section>
      ) : null}

      <section className="adminReportsPanel">
        <h2 className="mapHeadingText">All Reports</h2>
        {loading ? <p className="statusMessageText">Loading reports...</p> : null}
        {!loading && reports.length === 0 ? <p className="statusMessageText">No reports found for current filters.</p> : null}

        <div className="adminReportGrid">
          {reports.map((report) => (
            <article className="adminReportCard" key={report._id}>
              <img src={report.imageUrl} alt="Road damage report" className="adminReportImage" />
              <div className="adminReportBody">
                <p><strong>Damage:</strong> {report.damageType}</p>
                <p><strong>Confidence:</strong> {report.confidence}%</p>
                <p><strong>Area:</strong> {report.location}</p>
                <p><strong>User:</strong> {report.userId?.name || 'Unknown'} ({report.userId?.email || 'N/A'})</p>
                <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                <div className="adminReportActions">
                  <button type="button" className="actionButtonEdit" onClick={() => handleEdit(report._id)}>Edit</button>
                  <button type="button" className="deleteButtonRed" onClick={() => handleDelete(report._id)}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AdminDashboardPage;
