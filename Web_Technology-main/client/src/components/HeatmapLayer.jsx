import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) {
      return undefined;
    }

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 20,
      maxZoom: 16,
      minOpacity: 0.4,
      gradient: {
        0.2: '#fef08a',
        0.5: '#f97316',
        0.8: '#dc2626',
        1.0: '#7f1d1d'
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

export default HeatmapLayer;
