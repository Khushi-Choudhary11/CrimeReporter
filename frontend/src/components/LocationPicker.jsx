import React from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; 

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function LocationPicker({ onLocationChange }) {
  return (
    <div style={{ height: "400px", width: "100%", margin: "1rem 0" }}>
      <MapContainer
        center={[28.6562, 77.2410]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });
  return null;
}
