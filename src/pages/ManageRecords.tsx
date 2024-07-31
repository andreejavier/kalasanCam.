import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput, IonList } from '@ionic/react';

interface Record {
  id: number;
  description: string;
  speciesName: string;
}

const ManageRecords: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [description, setDescription] = useState<string>('');
  const [speciesName, setSpeciesName] = useState<string>('');

  const addRecord = () => {
    const newRecord: Record = { id: Date.now(), description, speciesName };
    setRecords([...records, newRecord]);
    setDescription('');
    setSpeciesName('');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manage Records</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          {records.map((record) => (
            <IonItem key={record.id}>
              <IonLabel>{record.description} ({record.speciesName})</IonLabel>
            </IonItem>
          ))}
        </IonList>
        <IonItem>
          <IonLabel position="floating">Description</IonLabel>
          <IonInput value={description} onIonChange={(e) => setDescription(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Species Name</IonLabel>
          <IonInput value={speciesName} onIonChange={(e) => setSpeciesName(e.detail.value!)} />
        </IonItem>
        <IonButton expand="full" onClick={addRecord}>Add Record</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ManageRecords;
