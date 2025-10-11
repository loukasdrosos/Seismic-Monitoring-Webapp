import { useMap } from 'react-leaflet'; // hook to access the Leaflet map instance
import "leaflet.heat"; // import the heatmap plugin
import L from 'leaflet'; // import Leaflet library
import { useEffect } from 'react';

// HeatmapLayer component to add a heatmap layer to the Leaflet map

function HeatmapLayer({ points}) {
    const map = useMap(); // get access to the current Leaflet map object

    useEffect(() => {
        if (!map) {
            return null;
        }

        // Convert earthquake data into [lat, lon, intensity] format, intensity default is 1 if no magnitude, then filter out invalid coords 
        const eqData = points
            .map(eq => [parseFloat(eq.latitude), parseFloat(eq.longitude), eq.magnitude || 1])
            .filter(([lat, lon]) => !isNaN(lat) && !isNaN(lon));

        // Add the heat layer to the map, radius:  size of each point “blob” in pixels, blur: amount of blur to spread intensity, maxZoom: zoom level where the points reach maximum intensity
        const layer = L.heatLayer(eqData, { radius: 15, blur: 20, maxZoom: 10, minOpacity: 0.1 }).addTo(map);

        return () => {
            map.removeLayer(layer); // cleanup function to remove the heat layer when component unmounts or points change
        };
    }, [map, points]);

  return null;
}

export default HeatmapLayer;