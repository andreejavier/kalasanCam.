import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonImg, IonInput, IonLabel, IonItem } from '@ionic/react';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import ExploreContainer from '../components/ExploreContainer';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Tab1.css';
import EXIF from 'exif-js';

// Fix for default icon issues with Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

const Tab1: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
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

  const captureImage = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
    });

    const imageUri = image.webPath;
    setImage(imageUri || null);
    if (imageUri) {
      await extractGPSData(imageUri);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageSrc = e.target?.result as string;
        setImage(imageSrc);
        await extractGPSData(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractGPSData = async (imageSrc: string) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        EXIF.getData(reader.result as string, function() {
          const lat = EXIF.getTag(this, "GPSLatitude");
          const lon = EXIF.getTag(this, "GPSLongitude");
          const latRef = EXIF.getTag(this, "GPSLatitudeRef");
          const lonRef = EXIF.getTag(this, "GPSLongitudeRef");
          const dateTime = EXIF.getTag(this, "DateTime");

          if (lat && lon && latRef && lonRef) {
            const latitude = convertDMSToDD(lat, latRef);
            const longitude = convertDMSToDD(lon, lonRef);
            setPosition([latitude, longitude]);
            setLatitude(latitude);
            setLongitude(longitude);
            setTimestamp(dateTime || 'Unknown');
          }
        });
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error fetching and extracting EXIF data:', error);
    }
  };

  const convertDMSToDD = (dms: number[], ref: string) => {
    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (ref === "S" || ref === "W") {
      dd = dd * -1;
    }
    return dd;
  };

  const handleSubmit = async () => {
    if (position && image) {
      // Logic to upload image and metadata
      try {
        // Example of uploading image (you'll need to adjust this based on your server or storage setup)
        const response = await fetch(image);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');
        formData.append('description', description);
        formData.append('speciesName', speciesName);
        formData.append('timestamp', timestamp);
        formData.append('latitude', latitude?.toFixed(6) || '');
        formData.append('longitude', longitude?.toFixed(6) || '');
        
        const uploadResponse = await fetch('YOUR_SERVER_UPLOAD_ENDPOINT', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          console.log('Image and metadata successfully uploaded');
        } else {
          console.error('Failed to upload image and metadata');
        }
      } catch (error) {
        console.error('Error during upload:', error);
      }
    } else {
      console.error('No image or position data available');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mapping Endemic Tree Species</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Mapping Endemic Tree Species</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Map and EXIF Integration" />
        <IonButton onClick={captureImage}>Capture Image</IonButton>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {image && <IonImg src={image} />}
        {userPosition && (
          <MapContainer center={userPosition} zoom={13} style={{ height: '400px', width: '100%' }}>
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
        {image && (
          <div className="floating-form">
            <IonItem>
              <IonLabel position="floating">Description</IonLabel>
              <IonInput value={description} onIonInput={(e: any) => setDescription(e.target.value)} />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Species Name</IonLabel>
              <IonInput value={speciesName} onIonInput={(e: any) => setSpeciesName(e.target.value)} />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Timestamp</IonLabel>
              <IonInput value={timestamp} disabled />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Latitude</IonLabel>
              <IonInput value={latitude?.toFixed(6) || ''} disabled />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Longitude</IonLabel>
              <IonInput value={longitude?.toFixed(6) || ''} disabled />
            </IonItem>
            <IonButton onClick={handleSubmit} expand="full" style={{ marginTop: '10px' }}>
              Submit
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
