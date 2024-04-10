import React, { useContext, useState } from 'react';
import "../styles/profile-page.css";
import { gql, useQuery } from '@apollo/client';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import { AuthContext } from '../context/auth';
import RsvpButton from './RsvpButton';
import Button from './Button';
import { formatDate, formatDistance, formatTime } from '../util/Formatters';

interface EventModalProps {
    event: any | null;
    setEvent: (nullEvent: string | null) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, setEvent }) => {
    const { user } = useContext(AuthContext);
    const [isJoined, setIsJoined] = useState(user?.username && event.participants.includes(user?.username));
    
    const { data: routeData } = useQuery(FETCH_ROUTE, {
        variables: {
            routeID: event.route,
        },
    })

    const modalMap = () => {
        return(
            <MapContainer
                key={`modalMap`}
                style={{ height: '400px', width: '100%', minWidth: '250px', zIndex: 1}}
                center={routeData.getRoute.startCoordinates}
                zoom={9}
                dragging={true}
                zoomControl={true}
                doubleClickZoom={true}
                scrollWheelZoom={true}
                touchZoom={true}
                boxZoom={true}
                tap={true}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline
                pathOptions={{ fillColor: 'red', color: 'blue' }}
                positions={routeData.getRoute.points}
                />
            </MapContainer>
        );
    };

    const generateGPXFile = () => {
        if (!routeData || !routeData.getRoute) return;
    
        const now = new Date().toISOString();
    
        let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxdata="http://www.cluetrust.com/XML/GPXDATA/1/0" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.cluetrust.com/XML/GPXDATA/1/0 http://www.cluetrust.com/Schemas/gpxdata10.xsd" version="1.1" creator="http://ridewithgps.com/">
      <metadata>
        <name>${event.name}</name>
        <link href="https://ridewithgps.com/routes/${event.route}">
          <text>${event.name}</text>
        </link>
        <time>${now}</time>
      </metadata>
      <trk>
        <name>${event.name}</name>
        <trkseg>`;
    
        for (let i = 0; i < routeData.getRoute.points.length; i++) {
            const [lat, lon] = routeData.getRoute.points[i];
            const ele = routeData.getRoute.elevation[i];
            gpxContent += `
          <trkpt lat="${lat}" lon="${lon}">
            <ele>${ele}</ele>
          </trkpt>`;
        }
    
        gpxContent += `
        </trkseg>
      </trk>
    </gpx>`;
    
        const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${event.name}.gpx`;
        link.click();
    };

    const toggleJoinedStatus = (status: boolean) => {
        setIsJoined(status);
    };

    const handleClose = () => {
        setEvent(null);
    }

    return (
        <div className="profile-page-popover-ride-details-container">
            {event ? (
                <div className="ride-card-modal-overlay" >
            
                <div className="ride-card-modal-container" >
                    <span className="rode-card-close-modal" onClick={handleClose} >X</span>
                    <div style={{ textAlign: 'center' }}>{
                        routeData ? (
                                <div>{modalMap()}</div>
                            ) : (
                                <div style={{ width: '400px', height: '400px', backgroundColor: '#f2f2f2' }}></div>
                    )}</div>
                    {routeData ? (
                        <div className="ride-card-modal-values" >
                            <h2>{event.name}</h2>
                            <p>Created by <b>{event.host}</b></p>
                            <p>Riders: <b>{event.participants.length}</b></p>
                            <p>Starts at <b>{formatTime(event.startTime)}</b> on <b>{formatDate(event.startTime)}</b></p>
                            <p>Bike Type: <b>{event.bikeType.join(', ')}</b></p>
                            <p><b>{event.difficulty}</b> difficulty</p>
                            <p>{formatDistance(routeData.getRoute.distance)} km</p>
                            <p>{event.description}</p>
                            <div className="rsvp-button" >
                                <br />
                                <RsvpButton
                                    eventID={event._id}
                                    isJoined={isJoined}
                                    setJoinedStatus={toggleJoinedStatus}
                                    type="secondary"/>
                                <Button marginTop={12} type="secondary" onClick={generateGPXFile}>Download</Button>
                                {event.host === user?.username ? (
                                    <Button marginTop={12} type="secondary">Edit</Button>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </div>  
                    ) : (
                        <></>
                    )}
                </div>
            </div>
            ) : (
                <></>
            )}
        </div>
    )
}

const FETCH_ROUTE = gql`
  query getRoute($routeID: String!) {
    getRoute(routeID: $routeID) {
        points
        distance
        elevation
        startCoordinates
    }
  }
`

export default EventModal;