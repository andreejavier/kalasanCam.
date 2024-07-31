import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput, IonList } from '@ionic/react';

interface User {
  id: number;
  name: string;
  email: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const addUser = () => {
    const newUser: User = { id: Date.now(), name, email };
    setUsers([...users, newUser]);
    setName('');
    setEmail('');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manage Users</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          {users.map((user) => (
            <IonItem key={user.id}>
              <IonLabel>{user.name} ({user.email})</IonLabel>
            </IonItem>
          ))}
        </IonList>
        <IonItem>
          <IonLabel position="floating">Name</IonLabel>
          <IonInput value={name} onIonChange={(e) => setName(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput value={email} onIonChange={(e) => setEmail(e.detail.value!)} />
        </IonItem>
        <IonButton expand="full" onClick={addUser}>Add User</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ManageUsers;
