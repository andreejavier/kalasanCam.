import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';
import ExploreContainer from '../components/ExploreContainer';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

const Tab2: React.FC = () => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [description, setDescription] = useState<string>('');
  const [speciesName, setSpeciesName] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    const getCurrentPosition = async () => {
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;
      setUserPosition([latitude, longitude]);
    };

    getCurrentPosition();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 2</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 2</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 2 page" />
        {userPosition && (
          <MapContainer center={userPosition} zoom={13} style={{ height: '400px', width: '100%', marginTop: '20px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={userPosition}>
              <Popup>Your current location</Popup>
            </Marker>
            {position && (
              <Marker position={position}>
                <Popup>
                  <div>
                    <p>{description}</p>
                    <p><strong>Species:</strong> {speciesName}</p>
                    <p><strong>Timestamp:</strong> {timestamp}</p>
                    <p><strong>Latitude:</strong> {latitude?.toFixed(6)}</p>
                    <p><strong>Longitude:</strong> {longitude?.toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
