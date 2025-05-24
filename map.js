import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function Map() {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

  // Загрузка данных
  const fetchData = async () => {
    try {
      const response = await fetch('https://your-fastapi-server/api/map-data');
      const data = await response.json();
      
      if (data.status === 'success') {
        setDefects(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  // Инициализация карты
  useEffect(() => {
    if (!map) {
      const newMap = L.map('map').setView([59.934280, 30.335098], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(newMap);
      setMap(newMap);
    }

    return () => {
      if (map) map.remove();
    };
  }, []);

  // Обновление маркеров
  useEffect(() => {
    if (map && defects.length > 0) {
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      defects.forEach(defect => {
        L.marker([defect.lat, defect.lng], {
          icon: L.icon({
            iconUrl: defect.type === 'яма' ? 
              'https://cdn-icons-png.flaticon.com/512/188/188918.png' : 
              'https://cdn-icons-png.flaticon.com/512/188/188913.png',
            iconSize: [32, 32]
          })
        })
        .addTo(map)
        .bindPopup(`<b>${defect.type}</b><br>${defect.time}`);
      });
    }
  }, [defects, map]);

  // Автообновление каждые 5 минут
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: 'white',
          padding: '10px',
          borderRadius: '5px'
        }}>
          Загрузка данных...
        </div>
      )}
      <div id="map" style={{ height: '100%' }} />
    </div>
  );
}

export default Map;
