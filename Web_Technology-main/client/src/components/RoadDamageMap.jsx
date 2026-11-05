import React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapLayer from './HeatmapLayer.jsx';
import '../styles/mapStyles.css';

const defaultCenter = [20.5937, 78.9629];

const RoadDamageMap = ({ reports }) => {
  const reportsWithCoordinates = reports.filter(
    (report) => Number.isFinite(report.latitude) && Number.isFinite(report.longitude)
  );
  const heatmapPoints = reportsWithCoordinates.map((report) => {
    const normalizedConfidence = Math.max(0.1, Math.min(1, (report.confidence || 0) / 100));
    return [report.latitude, report.longitude, normalizedConfidence];
  });

  if (reportsWithCoordinates.length === 0) {
    return (
      <section className="dashboardMapBox">
        <h2 className="mapHeadingText">Damage map</h2>
        <p className="statusMessageText">No GPS coordinates found yet. Upload reports from a device that allows location access.</p>
      </section>
    );
  }

  return (
    <section className="dashboardMapBox">
      <h2 className="mapHeadingText">Damage map</h2>
        <p className="mapLegendText">Heatmap legend: Red = high damage confidence zones</p>
      <MapContainer center={defaultCenter} zoom={5} className="leafletDamageMap">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
          <HeatmapLayer points={heatmapPoints} />
        {reportsWithCoordinates.map((report) => (
          <Marker key={report._id} position={[report.latitude, report.longitude]}>
            <Popup>
              <strong>{report.damageType}</strong>
              <br />
              {report.location}
              <br />
              Confidence: {report.confidence}%
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
};

export default RoadDamageMap;
