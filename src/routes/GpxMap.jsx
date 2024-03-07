import 'leaflet/dist/leaflet.css';
import React, { useState } from 'react';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import gpxParser from 'gpxparser';

export const extractRouteInfo = async (file) => {
  try {
    const reader = new FileReader();
    const gpxContent = await new Promise((resolve) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });

    const parser = new gpxParser();
    parser.parse(gpxContent);

    const routeInfo = {
      points: parser.tracks[0].points.map((point) => ({
        lat: point.lat,
        lon: point.lon,
      })),
      elevation: parser.tracks[0].points.map((point) => ({
        ele: point.ele,
      })),
      distance: parser.tracks[0].distance,
      max_elevation: parser.tracks[0].elevation.max,
      min_elevation: parser.tracks[0].elevation.min,
      total_elevation_gain: parser.tracks[0].elevation.max - parser.tracks[0].elevation.min,

      startCoordinates: [parser.tracks[0].points[0].lat, parser.tracks[0].points[0].lon],
      endCoordinates: [
        parser.tracks[0].points[parser.tracks[0].points.length - 1].lat,
        parser.tracks[0].points[parser.tracks[0].points.length - 1].lon,
      ],
    };

    console.log('Route Information:', routeInfo);

    return routeInfo;
  } catch (error) {
    console.error('Error extracting route information from GPX:', error);
    throw error;
  }
};

const GpxMap = () => {
  const [routeData, setRouteData] = useState(null);

  const handleFileSelect = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';

      fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (file) {
          try {
            const routeInfo = await extractRouteInfo(file);

            // Set the route data state
            setRouteData(routeInfo);
          } catch (error) {
            console.error('Error parsing GPX:', error);
          }
        }
      });

      fileInput.click();
    } catch (error) {
      console.error('Error loading GPX file:', error);
    }
  };

  if (!routeData) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={handleFileSelect}>Select GPX File</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <MapContainer
        center={routeData.startCoordinates}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: '300px', width: '250px', margin: '20px auto' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline
          pathOptions={{ fillColor: 'red', color: 'blue' }}
          positions={routeData.points}
        />
      </MapContainer>
    </div>
  );
};


export default GpxMap;
