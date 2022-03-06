import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

export default function App() {
  const mapContainerRef = useRef(null);
  const [lng, setLng] = useState(138);
  const [lat, setLat] = useState(35);
  const [zoom, setZoom] = useState(5);


  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // mapが動いた時に稼働する
    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4)); // getCenter: 地図の中心にあるポイントの新しい経度と緯度を取得
      setLat(map.getCenter().lat.toFixed(4)); // toFixed: 桁数切り上げ
      setZoom(map.getZoom().toFixed(2)); // getZoom: 地図に設定されているズームレベルを決定
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
}
