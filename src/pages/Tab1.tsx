import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonImg, IonInput, IonLabel, IonItem } from '@ionic/react';
import { Camera, CameraResultType } from '@capacitor/camera';
import EXIF from 'exif-js';

const Tab1: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [speciesName, setSpeciesName] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const captureImage = async () => {
    try {
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
    } catch (error) {
      console.error('Error capturing image:', error);
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
        EXIF.getData(reader.result as any, function() {
          const lat = EXIF.getTag(globalThis, "GPSLatitude");
          const lon = EXIF.getTag(globalThis, "GPSLongitude");
          const latRef = EXIF.getTag(globalThis, "GPSLatitudeRef");
          const lonRef = EXIF.getTag(globalThis, "GPSLongitudeRef");
          const dateTime = EXIF.getTag(globalThis, "DateTime");

          if (lat && lon && latRef && lonRef) {
            const latitude = convertDMSToDD(lat, latRef);
            const longitude = convertDMSToDD(lon, lonRef);
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
    if (latitude !== null && longitude !== null && image) {
      // Logic to upload image and metadata
      try {
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

  const handleClear = () => {
    setImage(null);
    setDescription('');
    setSpeciesName('');
    setTimestamp('');
    setLatitude(null);
    setLongitude(null);
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
        <IonButton onClick={captureImage}>Capture Image</IonButton>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginTop: '40px' }}>
          {image && (
            <IonImg src={image} style={{ maxWidth: '400px', maxHeight: '400px', objectFit: 'contain' }} />
          )}
          {image && (
            <div>
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <IonButton onClick={handleSubmit} expand="full">Submit</IonButton>
                <IonButton onClick={handleClear} expand="full" color="medium">Clear</IonButton>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
