import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getAuthHeaders } from '../utils/api';
import '../styles/uploadStyles.css';

const UploadPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [geoStatus, setGeoStatus] = useState('Detecting location...');
  const [capturedCoordinates, setCapturedCoordinates] = useState(null);

  const canUpload = Boolean(selectedFile);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Location not supported by this browser');
      setCapturedCoordinates(null);
      return;
    }

    setGeoStatus('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6))
        };
        setCapturedCoordinates(coords);
        setGeoStatus(`Location captured: ${coords.latitude}, ${coords.longitude}`);
      },
      () => {
        setCapturedCoordinates(null);
        setGeoStatus('Location permission denied or unavailable. Report will be saved without GPS.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    captureLocation();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a road image first');
      return;
    }

    setLoading(true);
    setMessage('');
    setErrorMessage('');
    setPredictionResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const resolvedLocation = capturedCoordinates
        ? `${capturedCoordinates.latitude}, ${capturedCoordinates.longitude}`
        : 'Unknown location';

      formData.append('location', resolvedLocation || 'Unknown location');

      if (capturedCoordinates) {
        formData.append('latitude', capturedCoordinates.latitude);
        formData.append('longitude', capturedCoordinates.longitude);
      }

      const response = await apiClient.post('/api/reports', formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      setPredictionResult(response.data.report);
      setMessage('Report saved successfully');
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="uploadPageShell">
      <section className="uploadSection">
        <h1 className="pageHeadingText">Upload road image</h1>
        <form className="uploadFormBox" onSubmit={handleSubmit}>
          <label className="fieldLabelText" htmlFor="roadImage">Road Image</label>
          <input className="formInputField" id="roadImage" type="file" accept="image/jpeg,image/png" onChange={handleFileChange} />
          {previewUrl ? <img src={previewUrl} alt="Road preview" className="uploadImagePreview" /> : null}
          <div className="geoCaptureRow">
            <p className="geoLocationText">{geoStatus}</p>
            <button type="button" className="secondaryActionButton" onClick={captureLocation}>
              Refresh GPS
            </button>
          </div>
          <button className="primaryFormButton" type="submit" disabled={loading || !canUpload}>
            {loading ? 'Uploading...' : 'Submit report'}
          </button>
        </form>
        {message ? <p className="successMessageText">{message}</p> : null}
        {errorMessage ? <p className="errorMessageText">{errorMessage}</p> : null}
        {predictionResult ? (
          <div className="predictionResultCard">
            <h2 className="predictionCardTitle">Latest detection</h2>
            <p>Damage type: {predictionResult.damageType}</p>
            <p>Confidence: {predictionResult.confidence}%</p>
            <p>Location: {predictionResult.location}</p>
            <button type="button" className="secondaryActionButton" onClick={() => navigate('/dashboard')}>Go to dashboard</button>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default UploadPage;
