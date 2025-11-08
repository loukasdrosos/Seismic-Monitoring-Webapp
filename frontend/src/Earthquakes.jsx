import { useEffect, useState, useRef, use } from "react";    
import axios from "axios";
import './Earthquakes.css';
import IncreaseDecreaseButtons from "./IncreaseDecreaseButtons";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerOverrides.css';
import { enUS } from 'date-fns/locale';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, divIcon, point } from 'leaflet';
import customMarkerImg from "./image/custom-marker-icon.png";
import MarkerClusterGroup from "react-leaflet-markercluster";
import HeatmapLayer from "./HeatmapLayer";
import { XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

function Earthquakes() {

    // .env VARIABLES
    const minimumLatitude = parseFloat(import.meta.env.VITE_MINIMUM_LATITUDE);
    const maximumLatitude = parseFloat(import.meta.env.VITE_MAXIMUM_LATITUDE);
    const minimumLongitude = parseFloat(import.meta.env.VITE_MINIMUM_LONGITUDE);
    const maximumLongitude = parseFloat(import.meta.env.VITE_MAXIMUM_LONGITUDE);
    const centerLatitude = parseFloat(import.meta.env.VITE_CENTER_LATITUDE);
    const centerLongitude = parseFloat(import.meta.env.VITE_CENTER_LONGITUDE);
    const zoomLevel = parseInt(import.meta.env.VITE_DEFAULT_ZOOM_LEVEL);
    const baseUrl = import.meta.env.VITE_API_URL;    
    const useStadiaMaps = import.meta.env.VITE_USE_STADIA === 'true';
    const useStadiaMapsKey = import.meta.env.VITE_USE_STADIA_API_KEY === 'true';
    const stadiaApiKey = import.meta.env.VITE_STADIA_API_KEY;

    const todayObj = new Date();
    const yesterdayObj = new Date(todayObj);
    yesterdayObj.setDate(todayObj.getDate() - 1);

    const [earthquakes, setEarthquakes] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markerZoom, setMarkerZoom] = useState(true);
    const [sideBarOpen, setSideBarOpen] = useState(true);
    const [statsSidebarOpen, setStatsSidebarOpen] = useState(false);

    // Filter states
    const [minDate, setMinDate] = useState(yesterdayObj);
    const [maxDate, setMaxDate] = useState(todayObj);
    const [minLatitude, setMinLatitude] = useState(minimumLatitude);
    const [maxLatitude, setMaxLatitude] = useState(maximumLatitude);
    const [minLongitude, setMinLongitude] = useState(minimumLongitude);
    const [maxLongitude, setMaxLongitude] = useState(maximumLongitude);
    const [minDepth, setMinDepth] = useState(0);
    const [maxDepth, setMaxDepth] = useState(200);
    const [minMagnitude, setMinMagnitude] = useState(0.1);
    const [maxMagnitude, setMaxMagnitude] = useState(8);

    // Helper: convert Date → "YYYY-MM-DD"
    const formatDate = (dateObj) => dateObj.toISOString().split('T')[0];

    const fetchEarthquakes = async (
        minDate = "",
        maxDate = "",
        minLat="", 
        maxLat="",
        minLon="",
        maxLon="",
        minDepth="",
        maxDepth="",
        minMag = "", 
        maxMag = "") => {
        try {
            setLoading(true);
            setError(null);

            let url = `${baseUrl}/earthquakes/?`;
            if (minDate) url += `min_date=${minDate}&`;
            if (maxDate) url += `max_date=${maxDate}&`;
            if (minLat) url += `min_latitude=${minLat}&`;
            if (maxLat) url += `max_latitude=${maxLat}&`;
            if (minLon) url += `min_longitude=${minLon}&`;
            if (maxLon) url += `max_longitude=${maxLon}&`;
            if (minDepth) url += `min_depth=${minDepth}&`;
            if (maxDepth) url += `max_depth=${maxDepth}&`;
            if (minMag) url += `min_magnitude=${minMag}&`;
            if (maxMag) url += `max_magnitude=${maxMag}&`;
            
            url = url.slice(0, -1);  // Remove trailing '&' or '?'

            const response = await axios.get(url);

            if (clusterRef.current) {
                clusterRef.current.clearLayers();
            }

            setEarthquakes(response.data);

            if (response.data.length > 25000) {
                setMarkerZoom(false);
            }
            else {
                setMarkerZoom(true);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEarthquakeStats = async (
    minDate = "",
    maxDate = "",
    minLat = "",
    maxLat = "",
    minLon = "",
    maxLon = "",
    minDepth = "",
    maxDepth = "",
    minMag = "",
    maxMag = "") => {
    try {
        let url = `${baseUrl}/earthquakes/stats/?`;
        if (minDate) url += `min_date=${minDate}&`;
        if (maxDate) url += `max_date=${maxDate}&`;
        if (minLat) url += `min_latitude=${minLat}&`;
        if (maxLat) url += `max_latitude=${maxLat}&`;
        if (minLon) url += `min_longitude=${minLon}&`;
        if (maxLon) url += `max_longitude=${maxLon}&`;
        if (minDepth) url += `min_depth=${minDepth}&`;
        if (maxDepth) url += `max_depth=${maxDepth}&`;
        if (minMag) url += `min_magnitude=${minMag}&`;
        if (maxMag) url += `max_magnitude=${maxMag}&`;

        url = url.slice(0, -1);

        const response = await axios.get(url);
        setStats(response.data);
    } catch (error) {
        console.error("Error fetching stats:", error);
    }
};

    // Load default (last 24 hours) when the page loads
    useEffect(() => {
        fetchEarthquakes();
        fetchEarthquakeStats();
    }, []);

    useEffect(() => {
        if (stats && !stats.has_results) {
            setStatsSidebarOpen(false);
        }
    }, [stats]);


    // Check explicitly for empty (null, undefined, or empty string) so 0 can be treated as a valid value
    const isEmpty = (v) => v === '' || v === null || v === undefined;

    // Search button
    const handleSearch = () => {

        if (!minDate || !maxDate) {
            alert("A date must be selected in both date fields.");
            return;
        }

        if (isEmpty(minLatitude) || isEmpty(maxLatitude)) {
            alert("A latitude must be selected in both latitude fields.");
            return;
        }

        if (isEmpty(minLongitude) || isEmpty(maxLongitude)) {
            alert("A longitude must be selected in both longitude fields.");
            return;
        }

        if (isEmpty(minDepth) || isEmpty(maxDepth)) {
            alert("A depth must be selected in both depth fields.");
            return;
        }

        if (isEmpty(minMagnitude) || isEmpty(maxMagnitude)) {
            alert("A magnitude must be selected in both magnitude fields.");
            return;
        }

        fetchEarthquakes(
            formatDate(minDate),
            formatDate(maxDate),
            minLatitude,
            maxLatitude,
            minLongitude,
            maxLongitude,
            minDepth,
            maxDepth,
            minMagnitude,
            maxMagnitude);

        fetchEarthquakeStats(
            formatDate(minDate),
            formatDate(maxDate),
            minLatitude,
            maxLatitude,
            minLongitude,
            maxLongitude,
            minDepth,
            maxDepth,
            minMagnitude,
            maxMagnitude);
    };

    // Reset button, reset all filters to default values, get data from last 24 hours
    const handleReset = () => {
        setMinDate(yesterdayObj);
        setMaxDate(todayObj);
        setMinLatitude(33.51);
        setMaxLatitude(42.44);
        setMinLongitude(18.84);
        setMaxLongitude(29.44);
        setMinDepth(0);
        setMaxDepth(200);
        setMinMagnitude(0.1);
        setMaxMagnitude(8);
        setMarkerZoom(true);
        fetchEarthquakes();
        fetchEarthquakeStats();
    };

    const customMarkerIcon = new Icon({
        iconUrl: customMarkerImg,
        iconSize: [38, 38],
    });

    const createCustomClusterIcon = (cluster) => {
        return new divIcon({
            html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
            className: 'custom-cluster-icon',
            iconSize: point(25, 25, true),
        });
    };

    const mapRef = useRef();

    const clusterRef = useRef();

    const zoomToMarker = (eq) => {
        if (!markerZoom) return; // Do nothing if markerZoom is false
        
        const lat = parseFloat(eq.latitude);
        const lon = parseFloat(eq.longitude);

        if (isNaN(lat) || isNaN(lon) || !mapRef.current) return; // Do nothing if invalid coords or mapRef not set 

        mapRef.current.flyTo([lat, lon], 11, { duration: 1.2 }); // zoom level 11

        
        // ensure the marker is revealed if it is in a cluster
        if (clusterRef.current) {
            const layers = clusterRef.current.getLayers(); // all markers inside the cluster group
            const targetMarker = layers.find(marker => {
                const pos = marker.getLatLng();
                return pos.lat === lat && pos.lng === lon;
            });

            if (targetMarker) {
                // Wait until map has moved to zoom level 11
                setTimeout(() => {
                    clusterRef.current.zoomToShowLayer(targetMarker, () => {
                        targetMarker.openPopup(); // open popup after cluster unfolds
                    });
                }, 1200); // match flyTo duration
            }
        }
    };

useEffect(() => {
    if (mapRef.current) {
        setTimeout(() => {
        mapRef.current.invalidateSize();
        }, 450); // matches CSS transition duration
  }
}, [sideBarOpen, statsSidebarOpen]);

    return (
        <div className={`earthquakes-layout ${sideBarOpen ? 'sidebar-open' : 'sidebar-closed'} ${statsSidebarOpen ? 'stats-open' : 'stats-closed'}`}>

            {(loading || error) && (
            <div className="status-overlay">
                {loading && <p>Loading earthquakes data...</p>}
                {error && <p>Error fetching earthquakes data: {error.message}</p>}
            </div>
            )}

            {/* Left Side: Table + Filters */}
            <div className="earthquakes-list">
                {/* Title and buttons */}
                <div className="title">
                    <h2>Earthquakes in Greece</h2>
                    <div className="title-buttons">
                        <button className="search-button" onClick={handleSearch}>Search</button>
                        <button className="reset-button" onClick={handleReset}>Reset</button>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-grid">

                    {/* Headers for filter inputs */}
                    <div className="filter-header"> </div>
                    <div className="filter-header">Date</div>
                    <div className="filter-header">Latitude</div>
                    <div className="filter-header">Longitude</div>
                    <div className="filter-header">Depth (km)</div>
                    <div className="filter-header">Magnitude</div>

                    {/* Minimum filters */}
                    <div>From:</div>
                    <div>
                        <DatePicker
                            selected={minDate}
                            onChange={(date) => setMinDate(date)}
                            dateFormat="dd-MM-yyyy"
                            locale={enUS}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            popperPlacement="bottom-start"
                        />
                    </div>

                    <div>
                        <IncreaseDecreaseButtons
                            value={minLatitude}
                            onChange={setMinLatitude}
                            step={1}
                            min={33.51}
                            max={42.44}
                            decimalScale={4}
                            ariaLabel="Min Latitude"
                        />
                    </div>

                    <div>
                        <IncreaseDecreaseButtons
                            value={minLongitude}
                            onChange={setMinLongitude}
                            step={1}
                            min={18.84}
                            max={29.44}
                            decimalScale={4}
                            ariaLabel="Min Longitude"
                        />
                    </div>

                    <div>
                        <IncreaseDecreaseButtons
                            value={minDepth}
                            onChange={setMinDepth}
                            step={10}
                            min={0}
                            max={200}
                            decimalScale={1}
                            ariaLabel="Min Depth"
                        />
                    </div>

                    <div>
                        <IncreaseDecreaseButtons
                            value={minMagnitude}
                            onChange={setMinMagnitude}
                            step={0.1}
                            min={0.1}
                            max={8}
                            decimalScale={1}
                            ariaLabel="Min Magnitude"
                        />
                    </div>
        

                    {/* Maximum filters */}
                    <div>To:</div>
                    <div>
                        <DatePicker
                            selected={maxDate}
                            onChange={(date) => setMaxDate(date)}
                            dateFormat="dd-MM-yyyy"
                            locale={enUS}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            popperPlacement="bottom-start"
                        />
                    </div>

                    <div>
                        <IncreaseDecreaseButtons
                            value={maxLatitude}
                            onChange={setMaxLatitude}
                            step={1}
                            min={33.51}
                            max={42.44}
                            decimalScale={4}
                            ariaLabel="Max Latitude"
                        />
                    </div>

                    <div>
                        <IncreaseDecreaseButtons
                            value={maxLongitude}
                            onChange={setMaxLongitude}
                            step={1}
                            min={18.84}
                            max={29.44}
                            decimalScale={4}
                            ariaLabel="Max Longitude"
                        />
                    </div>

                    <div>
                        <IncreaseDecreaseButtons
                            value={maxDepth}
                            onChange={setMaxDepth}
                            step={10}
                            min={0}
                            max={200}
                            decimalScale={1}
                            ariaLabel="Max Depth"
                        />
                    </div>

                    <div>
                        <IncreaseDecreaseButtons
                            value={maxMagnitude}
                            onChange={setMaxMagnitude}
                            step={0.1}
                            min={0.1}
                            max={8}
                            decimalScale={1}
                            ariaLabel="Max Magnitude"
                        />
                    </div>
                </div>

                <div className="earthquakes-contents">

                    {!loading && !error && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Latitude</th>
                                    <th>Longitude</th>
                                    <th>Depth</th>
                                    <th>Magnitude</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earthquakes.length > 0 ? (
                                    earthquakes.map((eq) => (
                                        <tr key={eq.id} onClick={() => {zoomToMarker(eq)}}>
                                            <td>{eq.time}</td>
                                            <td>{eq.latitude}</td>
                                            <td>{eq.longitude}</td>
                                            <td>{eq.depth}</td>
                                            <td>{eq.magnitude}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center" }}>
                                            No earthquakes found for this date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div >
            </div>

            {stats?.has_results && (
            <div className="earthquakes-stats-sidebar">
                <h2>Earthquake Statistics</h2>

                {stats.filtered_stats.filtered_time_distribution_type && (
                <>
                    <h3>
                    Earthquakes per {stats.filtered_stats.filtered_time_distribution_type}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.filtered_stats.filtered_time_distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value]} cursor={{ fill: 'rgba(0,0,0,0.1)' }} position={{ y: 100 }} />
                        <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                    </ResponsiveContainer>

                    <h3>Average Magnitude per {stats.filtered_stats.filtered_time_distribution_type}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.filtered_stats.filtered_time_distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value]} cursor={{ fill: 'rgba(0,0,0,0.1)' }} position={{ y: 100 }}/>
                        <Bar dataKey="avg_magnitude" fill="#f0c34c" />
                    </BarChart>
                    </ResponsiveContainer>

                    <h3>Maximum Magnitude per {stats.filtered_stats.filtered_time_distribution_type}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.filtered_stats.filtered_time_distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value]} cursor={{ fill: 'rgba(0,0,0,0.1)' }} position={{ y: 100 }} />
                        <Bar dataKey="max_magnitude" fill="#d84f4f" />
                    </BarChart>
                    </ResponsiveContainer>
                </>
                )}
            </div>
            )}

            {/* Right Side: Leaflet Map */}
            <div className="earthquakes-map">

                <button className="toggle-sidebar-button"
                        onClick={() => setSideBarOpen(!sideBarOpen)}
                >
                    {sideBarOpen ? '⮜ Hide Filters' : '⮞ Show Filters'}
                </button>

                <button className="toggle-stats-sidebar-button"
                    onClick={() => {
                        if (stats?.has_results) setStatsSidebarOpen(!statsSidebarOpen);
                    }}
                    disabled={!stats?.has_results} // Disable if no results
                    title={!stats?.has_results ? "No data to show stats" : ""}
                >
                    {statsSidebarOpen ? '⮜ Hide Stats' : '⮞ Show Stats'}
                </button>

                <MapContainer ref={mapRef} center ={[centerLatitude, centerLongitude]} zoom={zoomLevel} style={{ height: "100%", width: "100%" }}>
                    
                    {useStadiaMaps ? (
                        useStadiaMapsKey ? (
                            // Stadia Maps Satellite layer with API key (production)
                            <TileLayer
                                    url={`https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg?api_key=${stadiaApiKey}`}
                                    attribution="&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href='https://www.stadiamaps.com/' target='_blank'>Stadia Maps</a> &copy; <a href='https://openmaptiles.org/' target='_blank'>OpenMapTiles</a> &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                            />
                        ) : (
                            // Stadia Maps Satellite layer without API key (development only)
                            <TileLayer
                                url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
                                attribution="&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href='https://www.stadiamaps.com/' target='_blank'>Stadia Maps</a> &copy; <a href='https://openmaptiles.org/' target='_blank'>OpenMapTiles</a> &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                            />
                        )
      
                    ) : (
                        // OpenStreetMap Standard layer
                       <TileLayer
                            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                        />
                    )}   

                    {earthquakes.length > 25000 ? (
                        <HeatmapLayer points={earthquakes} />
                    ) : (
                        <MarkerClusterGroup 
                            key={earthquakes.length + JSON.stringify(earthquakes.slice(0, 10))} // unique key to force remount on data change
                            ref={clusterRef} 
                            chunkedLoading 
                            iconCreateFunction={createCustomClusterIcon}
                        >
                            {earthquakes.map((eq) => {
                                const lat = parseFloat(eq.latitude); //Parse to float to avoid issues with °N
                                const lon = parseFloat(eq.longitude); //Parse to float to avoid issues with °E

                                if (isNaN(lat) || isNaN(lon)) return null;  // Skip invalid coordinates

                                return (
                                    <Marker key={eq.id} position={[lat, lon]} icon={customMarkerIcon}>
                                        <Popup>
                                            <strong>Time:</strong> {eq.time}<br/>
                                            <strong>Latitude:</strong> {eq.latitude}<br/>
                                            <strong>Longitude:</strong> {eq.longitude}<br/>
                                            <strong>Depth:</strong> {eq.depth}<br/>
                                            <strong>Magnitude:</strong> {eq.magnitude}
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MarkerClusterGroup>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}

export default Earthquakes;
